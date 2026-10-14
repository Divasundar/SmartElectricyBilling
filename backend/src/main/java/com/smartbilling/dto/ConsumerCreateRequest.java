package com.smartbilling.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ConsumerCreateRequest {

    @NotBlank(message = "Consumer ID is required")
    private String consumerId;

    @NotBlank(message = "Consumer name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Connection type is required")
    private String connectionType;

    private Double sanctionedLoad = 5.0;

    public ConsumerCreateRequest() {}

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

    public Double getSanctionedLoad() { return sanctionedLoad; }
    public void setSanctionedLoad(Double sanctionedLoad) { this.sanctionedLoad = sanctionedLoad; }
}
