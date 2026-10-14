package com.smartbilling.billing;

import com.smartbilling.entity.TariffSlab;
import com.smartbilling.exception.InvalidReadingException;
import com.smartbilling.exception.MissingTariffException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class BillingCalculatorService {

    public static final BigDecimal DEFAULT_TAX_RATE = new BigDecimal("0.10");
    public static final BigDecimal DEFAULT_SURCHARGE = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    public static BigDecimal roundMoney(BigDecimal val) {
        return val.setScale(2, RoundingMode.HALF_UP);
    }

    public long calculateConsumption(long previousReading, long currentReading) {
        if (currentReading < previousReading) {
            throw new InvalidReadingException(
                String.format("Current reading (%d kWh) cannot be less than previous reading (%d kWh).",
                    currentReading, previousReading)
            );
        }
        return currentReading - previousReading;
    }

    public List<TariffSlab> getActiveTariffSlabs(List<TariffSlab> slabs, String category) {
        return slabs.stream()
            .filter(t -> t.getConnectionType().equalsIgnoreCase(category) && "ACTIVE".equalsIgnoreCase(t.getStatus()))
            .sorted(Comparator.comparingInt(TariffSlab::getSlabFrom))
            .toList();
    }

    public BillingResult calculateBill(long previousReading, long currentReading, String connectionType,
                                        List<TariffSlab> activeSlabs, BigDecimal taxRate, BigDecimal surcharge) {
        long unitsConsumed = calculateConsumption(previousReading, currentReading);

        if (activeSlabs == null || activeSlabs.isEmpty()) {
            throw new MissingTariffException(
                String.format("No active tariff is configured for this consumer category (%s).", connectionType)
            );
        }

        BigDecimal cleanTaxRate = taxRate != null ? taxRate : DEFAULT_TAX_RATE;
        BigDecimal cleanSurcharge = surcharge != null ? roundMoney(surcharge) : DEFAULT_SURCHARGE;

        BigDecimal fixedCharge = activeSlabs.get(0).getFixedCharge() != null
            ? roundMoney(activeSlabs.get(0).getFixedCharge())
            : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        BigDecimal energyCharges = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        List<SlabBreakdownResult> breakdown = new ArrayList<>();
        long unitsRemaining = unitsConsumed;

        if (unitsConsumed > 0) {
            for (TariffSlab slab : activeSlabs) {
                if (unitsRemaining <= 0) break;

                long slabCapacity;
                if (slab.getSlabTo() == 0 || slab.getSlabTo() == null) {
                    slabCapacity = Long.MAX_VALUE; // Unbounded final slab
                } else if (slab.getSlabFrom() == 0) {
                    slabCapacity = slab.getSlabTo();
                } else {
                    slabCapacity = (long) slab.getSlabTo() - slab.getSlabFrom() + 1;
                }

                long unitsInSlab = Math.min(unitsRemaining, slabCapacity);
                BigDecimal amount = roundMoney(slab.getRatePerUnit().multiply(BigDecimal.valueOf(unitsInSlab)));

                energyCharges = roundMoney(energyCharges.add(amount));
                unitsRemaining -= unitsInSlab;

                String slabRange = slab.getSlabTo() == 0
                    ? (slab.getSlabFrom() == 0 ? "All units" : "Above " + (slab.getSlabFrom() - 1) + " units")
                    : slab.getSlabFrom() + "–" + slab.getSlabTo() + " units";

                breakdown.add(new SlabBreakdownResult(
                    slab.getName(),
                    slabRange,
                    unitsInSlab,
                    roundMoney(slab.getRatePerUnit()),
                    amount
                ));
            }
        }

        BigDecimal subtotal = roundMoney(energyCharges.add(fixedCharge));
        BigDecimal tax = roundMoney(subtotal.multiply(cleanTaxRate));
        BigDecimal totalAmount = roundMoney(subtotal.add(tax).add(cleanSurcharge));

        BillingResult result = new BillingResult();
        result.setPreviousReading(previousReading);
        result.setCurrentReading(currentReading);
        result.setUnitsConsumed(unitsConsumed);
        result.setEnergyCharges(energyCharges);
        result.setFixedCharge(fixedCharge);
        result.setTaxRate(cleanTaxRate);
        result.setTax(tax);
        result.setSurcharge(cleanSurcharge);
        result.setTotalAmount(totalAmount);
        result.setSlabBreakdown(breakdown);
        result.setConnectionType(connectionType);

        return result;
    }

    public String generateBillNumber(long sequenceCount) {
        int year = LocalDate.now().getYear();
        return String.format("BILL-%d-%06d", year, sequenceCount + 1);
    }
}
