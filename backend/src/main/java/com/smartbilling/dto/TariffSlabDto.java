package com.smartbilling.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TariffSlabDto {
    private Long id;
    private String name;
    private String connectionType;
    private Integer slabFrom;
    private Integer slabTo;
    private BigDecimal ratePerUnit;
    private BigDecimal fixedCharge;
    private String status;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;

    public TariffSlabDto() {}

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
