package com.smartbilling.service;

import com.smartbilling.billing.BillingCalculatorService;
import com.smartbilling.billing.BillingResult;
import com.smartbilling.billing.SlabBreakdownResult;
import com.smartbilling.dto.BillCalculationRequest;
import com.smartbilling.dto.BillCalculationResponse;
import com.smartbilling.dto.BillGenerationRequest;
import com.smartbilling.dto.BillResponse;
import com.smartbilling.entity.Bill;
import com.smartbilling.entity.BillSlabBreakdown;
import com.smartbilling.entity.Consumer;
import com.smartbilling.entity.Meter;
import com.smartbilling.entity.TariffSlab;
import com.smartbilling.exception.DuplicateBillException;
import com.smartbilling.exception.ResourceNotFoundException;
import com.smartbilling.repository.BillRepository;
import com.smartbilling.repository.ConsumerRepository;
import com.smartbilling.repository.MeterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final ConsumerRepository consumerRepository;
    private final MeterRepository meterRepository;
    private final TariffService tariffService;
    private final BillingCalculatorService billingCalculatorService;

    public BillService(BillRepository billRepository,
                       ConsumerRepository consumerRepository,
                       MeterRepository meterRepository,
                       TariffService tariffService,
                       BillingCalculatorService billingCalculatorService) {
        this.billRepository = billRepository;
        this.consumerRepository = consumerRepository;
        this.meterRepository = meterRepository;
        this.tariffService = tariffService;
        this.billingCalculatorService = billingCalculatorService;
    }

    public List<BillResponse> getAllBills() {
        return billRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    public BillResponse getBillById(Long id) {
        Bill bill = billRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + id));
        return mapToResponse(bill);
    }

    public List<BillResponse> getBillsByConsumer(String consumerId) {
        return billRepository.findByConsumerConsumerIdOrderByCreatedAtDesc(consumerId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    public BillCalculationResponse calculatePreview(BillCalculationRequest req) {
        Consumer consumer = consumerRepository.findByConsumerId(req.getConsumerId())
            .orElseThrow(() -> new ResourceNotFoundException("Consumer not found: " + req.getConsumerId()));

        List<TariffSlab> activeSlabs = tariffService.getActiveTariffEntitiesByCategory(consumer.getConnectionType());

        BillingResult calc = billingCalculatorService.calculateBill(
            req.getPreviousReading(),
            req.getCurrentReading(),
            consumer.getConnectionType(),
            activeSlabs,
            BillingCalculatorService.DEFAULT_TAX_RATE,
            BillingCalculatorService.DEFAULT_SURCHARGE
        );

        BillCalculationResponse response = new BillCalculationResponse();
        response.setConsumerId(consumer.getConsumerId());
        response.setConsumerName(consumer.getName());
        response.setMeterNumber(req.getMeterNumber() != null ? req.getMeterNumber() : "MTR-DEFAULT");
        response.setConnectionType(consumer.getConnectionType());
        response.setBillingPeriod(req.getBillingPeriod());
        response.setPreviousReading(calc.getPreviousReading());
        response.setCurrentReading(calc.getCurrentReading());
        response.setUnitsConsumed(calc.getUnitsConsumed());
        response.setEnergyCharges(calc.getEnergyCharges());
        response.setFixedCharge(calc.getFixedCharge());
        response.setSubtotal(calc.getEnergyCharges().add(calc.getFixedCharge()));
        response.setTaxRate(calc.getTaxRate());
        response.setTax(calc.getTax());
        response.setSurcharge(calc.getSurcharge());
        response.setTotalAmount(calc.getTotalAmount());
        response.setSlabBreakdown(calc.getSlabBreakdown());

        return response;
    }

    @Transactional
    public BillResponse generateBill(BillGenerationRequest req) {
        Consumer consumer = consumerRepository.findByConsumerId(req.getConsumerId())
            .orElseThrow(() -> new ResourceNotFoundException("Consumer not found: " + req.getConsumerId()));

        // Duplicate Bill Check (Requirement 10 & 16)
        if (billRepository.existsByConsumerConsumerIdAndBillingPeriodIgnoreCase(
            req.getConsumerId(), req.getBillingPeriod().trim())) {
            throw new DuplicateBillException(
                String.format("Bill already exists for consumer %s and billing period %s.",
                    req.getConsumerId(), req.getBillingPeriod())
            );
        }

        // Meter resolution
        Meter meter = null;
        if (req.getMeterNumber() != null && !req.getMeterNumber().isBlank()) {
            meter = meterRepository.findByMeterNumber(req.getMeterNumber()).orElse(null);
        }
        if (meter == null) {
            List<Meter> consumerMeters = meterRepository.findByConsumerId(consumer.getId());
            if (!consumerMeters.isEmpty()) {
                meter = consumerMeters.get(0);
            }
        }
        if (meter == null) {
            throw new ResourceNotFoundException("No meter found for consumer: " + req.getConsumerId());
        }

        List<TariffSlab> activeSlabs = tariffService.getActiveTariffEntitiesByCategory(consumer.getConnectionType());

        BillingResult calc = billingCalculatorService.calculateBill(
            req.getPreviousReading(),
            req.getCurrentReading(),
            consumer.getConnectionType(),
            activeSlabs,
            BillingCalculatorService.DEFAULT_TAX_RATE,
            BillingCalculatorService.DEFAULT_SURCHARGE
        );

        long billCount = billRepository.count();
        String billNumber = billingCalculatorService.generateBillNumber(billCount);

        LocalDate dueDate = req.getDueDate() != null ? req.getDueDate() : LocalDate.now().plusDays(15);

        Bill bill = new Bill();
        bill.setBillNumber(billNumber);
        bill.setConsumer(consumer);
        bill.setMeter(meter);
        bill.setBillingPeriod(req.getBillingPeriod().trim());
        bill.setPreviousReading(calc.getPreviousReading());
        bill.setCurrentReading(calc.getCurrentReading());
        bill.setUnitsConsumed(calc.getUnitsConsumed());
        bill.setEnergyCharges(calc.getEnergyCharges());
        bill.setFixedCharge(calc.getFixedCharge());
        bill.setTaxRate(calc.getTaxRate());
        bill.setTax(calc.getTax());
        bill.setSurcharge(calc.getSurcharge());
        bill.setTotalAmount(calc.getTotalAmount());
        bill.setStatus("UNPAID");
        bill.setDueDate(dueDate);
        bill.setCreatedAt(LocalDateTime.now());

        // Add progressive slab breakdowns
        for (SlabBreakdownResult s : calc.getSlabBreakdown()) {
            BillSlabBreakdown b = new BillSlabBreakdown(
                s.getSlabName(),
                s.getSlabRange(),
                s.getUnitsInSlab(),
                s.getRatePerUnit(),
                s.getAmount()
            );
            bill.addSlabBreakdown(b);
        }

        Bill saved = billRepository.save(bill);

        // Synchronize meter reading
        meter.setPreviousReading(calc.getPreviousReading());
        meter.setCurrentReading(calc.getCurrentReading());
        meterRepository.save(meter);

        return mapToResponse(saved);
    }

    public List<SlabBreakdownResult> getBillBreakdown(Long id) {
        Bill bill = billRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + id));

        return bill.getSlabBreakdowns().stream()
            .map(b -> new SlabBreakdownResult(
                b.getSlabName(),
                b.getSlabRange(),
                b.getUnitsInSlab(),
                b.getRatePerUnit(),
                b.getAmount()
            ))
            .toList();
    }

    public BillResponse mapToResponse(Bill bill) {
        BillResponse dto = new BillResponse();
        dto.setId(bill.getId());
        dto.setBillNumber(bill.getBillNumber());
        dto.setBillId(bill.getBillNumber());
        if (bill.getConsumer() != null) {
            dto.setConsumerId(bill.getConsumer().getConsumerId());
            dto.setConsumerName(bill.getConsumer().getName());
            dto.setConnectionType(bill.getConsumer().getConnectionType());
        }
        if (bill.getMeter() != null) {
            dto.setMeterId(String.valueOf(bill.getMeter().getId()));
            dto.setMeterNumber(bill.getMeter().getMeterNumber());
        }
        dto.setBillingPeriod(bill.getBillingPeriod());
        dto.setPreviousReading(bill.getPreviousReading());
        dto.setCurrentReading(bill.getCurrentReading());
        dto.setUnitsConsumed(bill.getUnitsConsumed());
        dto.setEnergyCharges(bill.getEnergyCharges());
        dto.setFixedCharge(bill.getFixedCharge());
        dto.setTaxRate(bill.getTaxRate());
        dto.setTax(bill.getTax());
        dto.setSurcharge(bill.getSurcharge());

        // Derive OVERDUE status if past due date
        String currentStatus = bill.getStatus();
        if ("UNPAID".equalsIgnoreCase(currentStatus) && LocalDate.now().isAfter(bill.getDueDate())) {
            currentStatus = "OVERDUE";
        }
        dto.setStatus(currentStatus);

        dto.setTotalAmount(bill.getTotalAmount());
        dto.setDueDate(bill.getDueDate());
        dto.setCreatedAt(bill.getCreatedAt());

        if (bill.getSlabBreakdowns() != null) {
            dto.setSlabBreakdown(bill.getSlabBreakdowns().stream()
                .map(b -> new SlabBreakdownResult(
                    b.getSlabName(),
                    b.getSlabRange(),
                    b.getUnitsInSlab(),
                    b.getRatePerUnit(),
                    b.getAmount()
                ))
                .toList()
            );
        }

        return dto;
    }

    @Transactional
    public BillResponse updateBillStatus(Long id, String status) {
        Bill bill = billRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + id));
        bill.setStatus(status.toUpperCase());
        Bill saved = billRepository.save(bill);
        return mapToResponse(saved);
    }
}
