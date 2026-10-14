package com.smartbilling.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "consumers")
public class Consumer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consumer_id", nullable = false, unique = true, length = 50)
    private String consumerId; // e.g. "C10234"

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String address;

    @Column(name = "connection_type", nullable = false, length = 30)
    private String connectionType; // RESIDENTIAL, COMMERCIAL, INDUSTRIAL, AGRICULTURAL

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, SUSPENDED

    @Column(name = "sanctioned_load")
    private Double sanctionedLoad = 5.0; // in kW

    @Column(name = "created_at")
    private LocalDate createdAt = LocalDate.now();

    public Consumer() {}

    public Consumer(String consumerId, String name, String email, String phone, String address, String connectionType) {
        this.consumerId = consumerId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.connectionType = connectionType;
        this.status = "ACTIVE";
        this.sanctionedLoad = 5.0;
        this.createdAt = LocalDate.now();
    }

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
}
