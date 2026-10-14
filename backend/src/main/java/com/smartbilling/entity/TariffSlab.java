package com.smartbilling.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tariff_slabs")
public class TariffSlab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "connection_type", nullable = false, length = 30)
    private String connectionType; // RESIDENTIAL, COMMERCIAL, INDUSTRIAL, AGRICULTURAL

    @Column(name = "slab_from", nullable = false)
    private Integer slabFrom;

    @Column(name = "slab_to", nullable = false)
    private Integer slabTo; // 0 represents unbounded (Above X units)

    @Column(name = "rate_per_unit", nullable = false, precision = 10, scale = 2)
    private BigDecimal ratePerUnit;

    @Column(name = "fixed_charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal fixedCharge;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    public TariffSlab() {}

    public TariffSlab(String name, String connectionType, Integer slabFrom, Integer slabTo,
                      BigDecimal ratePerUnit, BigDecimal fixedCharge, LocalDate effectiveFrom) {
        this.name = name;
        this.connectionType = connectionType;
        this.slabFrom = slabFrom;
        this.slabTo = slabTo;
        this.ratePerUnit = ratePerUnit;
        this.fixedCharge = fixedCharge;
        this.status = "ACTIVE";
        this.effectiveFrom = effectiveFrom;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getConnectionType() { return connectionType; }
    public void setConnectionType(String connectionType) { this.connectionType = connectionType; }

    public Integer getSlabFrom() { return slabFrom; }
    public void setSlabFrom(Integer slabFrom) { this.slabFrom = slabFrom; }

    public Integer getSlabTo() { return slabTo; }
    public void setSlabTo(Integer slabTo) { this.slabTo = slabTo; }

    public BigDecimal getRatePerUnit() { return ratePerUnit; }
    public void setRatePerUnit(BigDecimal ratePerUnit) { this.ratePerUnit = ratePerUnit; }

    public BigDecimal getFixedCharge() { return fixedCharge; }
    public void setFixedCharge(BigDecimal fixedCharge) { this.fixedCharge = fixedCharge; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }

    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }
}
