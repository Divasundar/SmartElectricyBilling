package com.smartbilling.dto;

import com.smartbilling.billing.SlabBreakdownResult;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BillResponse {
    private Long id;
    private String billId; // For frontend compatibility (e.g. "BILL-2026-000001")
    private String billNumber;
    private String consumerId;
    private String consumerName;
    private String meterId;
    private String meterNumber;
    private String connectionType;
    private String billingPeriod;
    private Long previousReading;
    private Long currentReading;
    private Long unitsConsumed;
    private BigDecimal energyCharges;
    private BigDecimal fixedCharge;
    private BigDecimal taxRate;
    private BigDecimal tax;
    private BigDecimal surcharge;
    private BigDecimal totalAmount;
    private String status;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private List<SlabBreakdownResult> slabBreakdown = new ArrayList<>();

    public BillResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBillId() { return billId != null ? billId : billNumber; }
    public void setBillId(String billId) { this.billId = billId; }

    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }

    public String getConsumerId() { return consumerId; }
    public void setConsumerId(String consumerId) { this.consumerId = consumerId; }

    public String getConsumerName() { return consumerName; }
    public void setConsumerName(String consumerName) { this.consumerName = consumerName; }

    public String getMeterId() { return meterId; }
    public void setMeterId(String meterId) { this.meterId = meterId; }

    public String getMeterNumber() { return meterNumber; }
    public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }

    public String getConnectionType() { return connectionType; }
    public void setConnectionType(String connectionType) { this.connectionType = connectionType; }

    public String getBillingPeriod() { return billingPeriod; }
    public void setBillingPeriod(String billingPeriod) { this.billingPeriod = billingPeriod; }

    public Long getPreviousReading() { return previousReading; }
    public void setPreviousReading(Long previousReading) { this.previousReading = previousReading; }

    public Long getCurrentReading() { return currentReading; }
    public void setCurrentReading(Long currentReading) { this.currentReading = currentReading; }

    public Long getUnitsConsumed() { return unitsConsumed; }
    public void setUnitsConsumed(Long unitsConsumed) { this.unitsConsumed = unitsConsumed; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<SlabBreakdownResult> getSlabBreakdown() { return slabBreakdown; }
    public void setSlabBreakdown(List<SlabBreakdownResult> slabBreakdown) { this.slabBreakdown = slabBreakdown; }
}
