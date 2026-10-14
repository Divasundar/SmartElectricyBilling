package com.smartbilling.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class BillGenerationRequest {

    @NotBlank(message = "Consumer ID is required")
    private String consumerId;

    private String meterNumber;

    @NotBlank(message = "Billing period is required")
    private String billingPeriod;

    @NotNull(message = "Previous reading is required")
    private Long previousReading;

    @NotNull(message = "Current reading is required")
    private Long currentReading;

    private LocalDate dueDate;

    public BillGenerationRequest() {}

    public String getConsumerId() { return consumerId; }
    public void setConsumerId(String consumerId) { this.consumerId = consumerId; }

    public String getMeterNumber() { return meterNumber; }
    public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }

    public String getBillingPeriod() { return billingPeriod; }
    public void setBillingPeriod(String billingPeriod) { this.billingPeriod = billingPeriod; }

    public Long getPreviousReading() { return previousReading; }
    public void setPreviousReading(Long previousReading) { this.previousReading = previousReading; }

    public Long getCurrentReading() { return currentReading; }
    public void setCurrentReading(Long currentReading) { this.currentReading = currentReading; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
