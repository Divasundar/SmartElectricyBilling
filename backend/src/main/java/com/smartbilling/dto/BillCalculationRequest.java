package com.smartbilling.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BillCalculationRequest {

    @NotBlank(message = "Consumer ID is required")
    private String consumerId;

    private String meterNumber;

    @NotNull(message = "Previous reading is required")
    private Long previousReading;

    @NotNull(message = "Current reading is required")
    private Long currentReading;

    @NotBlank(message = "Billing period is required")
    private String billingPeriod;

    public BillCalculationRequest() {}

    public String getConsumerId() { return consumerId; }
    public void setConsumerId(String consumerId) { this.consumerId = consumerId; }

    public String getMeterNumber() { return meterNumber; }
    public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }

    public Long getPreviousReading() { return previousReading; }
    public void setPreviousReading(Long previousReading) { this.previousReading = previousReading; }

    public Long getCurrentReading() { return currentReading; }
    public void setCurrentReading(Long currentReading) { this.currentReading = currentReading; }

    public String getBillingPeriod() { return billingPeriod; }
    public void setBillingPeriod(String billingPeriod) { this.billingPeriod = billingPeriod; }
}
