package com.smartbilling.billing;

import java.math.BigDecimal;

public class SlabBreakdownResult {
    private String slabName;
    private String slabRange;
    private long unitsInSlab;
    private BigDecimal ratePerUnit;
    private BigDecimal amount;

    public SlabBreakdownResult() {}

    public SlabBreakdownResult(String slabName, String slabRange, long unitsInSlab, BigDecimal ratePerUnit, BigDecimal amount) {
        this.slabName = slabName;
        this.slabRange = slabRange;
        this.unitsInSlab = unitsInSlab;
        this.ratePerUnit = ratePerUnit;
        this.amount = amount;
    }

    public String getSlabName() { return slabName; }
    public void setSlabName(String slabName) { this.slabName = slabName; }

    public String getSlabRange() { return slabRange; }
    public void setSlabRange(String slabRange) { this.slabRange = slabRange; }

    public long getUnitsInSlab() { return unitsInSlab; }
    public void setUnitsInSlab(long unitsInSlab) { this.unitsInSlab = unitsInSlab; }

    public BigDecimal getRatePerUnit() { return ratePerUnit; }
    public void setRatePerUnit(BigDecimal ratePerUnit) { this.ratePerUnit = ratePerUnit; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
