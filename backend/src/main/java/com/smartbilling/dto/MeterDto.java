package com.smartbilling.dto;

import java.time.LocalDate;

public class MeterDto {
    private Long id;
    private String meterNumber;
    private Long consumerId;
    private String consumerCode;
    private String consumerName;
    private Long currentReading;
    private Long previousReading;
    private String meterType;
    private String status;
    private LocalDate installedAt;

    public MeterDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMeterNumber() { return meterNumber; }
    public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }

    public Long getConsumerId() { return consumerId; }
    public void setConsumerId(Long consumerId) { this.consumerId = consumerId; }

    public String getConsumerCode() { return consumerCode; }
    public void setConsumerCode(String consumerCode) { this.consumerCode = consumerCode; }

    public String getConsumerName() { return consumerName; }
    public void setConsumerName(String consumerName) { this.consumerName = consumerName; }

    public Long getCurrentReading() { return currentReading; }
    public void setCurrentReading(Long currentReading) { this.currentReading = currentReading; }

    public Long getPreviousReading() { return previousReading; }
    public void setPreviousReading(Long previousReading) { this.previousReading = previousReading; }

    public String getMeterType() { return meterType; }
    public void setMeterType(String meterType) { this.meterType = meterType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getInstalledAt() { return installedAt; }
    public void setInstalledAt(LocalDate installedAt) { this.installedAt = installedAt; }
}
