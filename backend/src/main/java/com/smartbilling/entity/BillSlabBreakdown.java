package com.smartbilling.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bill_slab_breakdowns")
public class BillSlabBreakdown {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    @JsonIgnore
    private Bill bill;

    @Column(name = "slab_name", nullable = false)
    private String slabName; // e.g. "Slab 1 (0-100 units)"

    @Column(name = "slab_range", nullable = false)
    private String slabRange; // e.g. "0–100 units"

    @Column(name = "units_in_slab", nullable = false)
    private Long unitsInSlab;

    @Column(name = "rate_per_unit", nullable = false, precision = 10, scale = 2)
    private BigDecimal ratePerUnit;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    public BillSlabBreakdown() {}

    public BillSlabBreakdown(String slabName, String slabRange, Long unitsInSlab, BigDecimal ratePerUnit, BigDecimal amount) {
        this.slabName = slabName;
        this.slabRange = slabRange;
        this.unitsInSlab = unitsInSlab;
        this.ratePerUnit = ratePerUnit;
        this.amount = amount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Bill getBill() { return bill; }
    public void setBill(Bill bill) { this.bill = bill; }

    public String getSlabName() { return slabName; }
    public void setSlabName(String slabName) { this.slabName = slabName; }

    public String getSlabRange() { return slabRange; }
    public void setSlabRange(String slabRange) { this.slabRange = slabRange; }

    public Long getUnitsInSlab() { return unitsInSlab; }
    public void setUnitsInSlab(Long unitsInSlab) { this.unitsInSlab = unitsInSlab; }

    public BigDecimal getRatePerUnit() { return ratePerUnit; }
    public void setRatePerUnit(BigDecimal ratePerUnit) { this.ratePerUnit = ratePerUnit; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
