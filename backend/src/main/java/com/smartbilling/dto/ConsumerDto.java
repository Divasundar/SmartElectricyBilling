package com.smartbilling.dto;

import java.time.LocalDate;

public class ConsumerDto {
    private Long id;
    private String consumerId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String connectionType;
    private String status;
    private Double sanctionedLoad;
    private LocalDate createdAt;
    private String meterNumber;

    public ConsumerDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getConsumerId() { return consumerId; }
    public void setConsumerId(String consumerId) { this.consumerId = consumerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getConnectionType() { return connectionType; }
    public void setConnectionType(String connectionType) { this.connectionType = connectionType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getSanctionedLoad() { return sanctionedLoad; }
    public void setSanctionedLoad(Double sanctionedLoad) { this.sanctionedLoad = sanctionedLoad; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public String getMeterNumber() { return meterNumber; }
    public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }
}
