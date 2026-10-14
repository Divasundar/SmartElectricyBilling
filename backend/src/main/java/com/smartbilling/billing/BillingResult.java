package com.smartbilling.billing;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class BillingResult {
    private long previousReading;
    private long currentReading;
    private long unitsConsumed;
    private BigDecimal energyCharges;
    private BigDecimal fixedCharge;
    private BigDecimal taxRate;
    private BigDecimal tax;
    private BigDecimal surcharge;
    private BigDecimal totalAmount;
    private List<SlabBreakdownResult> slabBreakdown = new ArrayList<>();
    private String connectionType;

    public BillingResult() {}

    public long getPreviousReading() { return previousReading; }
    public void setPreviousReading(long previousReading) { this.previousReading = previousReading; }

    public long getCurrentReading() { return currentReading; }
    public void setCurrentReading(long currentReading) { this.currentReading = currentReading; }

    public long getUnitsConsumed() { return unitsConsumed; }
    public void setUnitsConsumed(long unitsConsumed) { this.unitsConsumed = unitsConsumed; }

    public BigDecimal getEnergyCharges() { return energyCharges; }
    public void setEnergyCharges(BigDecimal energyCharges) { this.energyCharges = energyCharges; }

    public BigDecimal getFixedCharge() { return fixedCharge; }
    public void setFixedCharge(BigDecimal fixedCharge) { this.fixedCharge = fixedCharge; }

    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }

    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }

    public BigDecimal getSurcharge() { return surcharge; }
    public void setSurcharge(BigDecimal surcharge) { this.surcharge = surcharge; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public List<SlabBreakdownResult> getSlabBreakdown() { return slabBreakdown; }
    public void setSlabBreakdown(List<SlabBreakdownResult> slabBreakdown) { this.slabBreakdown = slabBreakdown; }

    public String getConnectionType() { return connectionType; }
    public void setConnectionType(String connectionType) { this.connectionType = connectionType; }
}
