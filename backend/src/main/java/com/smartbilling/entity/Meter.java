package com.smartbilling.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "meters")
public class Meter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meter_number", nullable = false, unique = true, length = 50)
    private String meterNumber; // e.g. "MTR-BLR-00124"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consumer_id", nullable = false)
    private Consumer consumer;

    @Column(name = "current_reading", nullable = false)
    private Long currentReading = 0L;

    @Column(name = "previous_reading", nullable = false)
    private Long previousReading = 0L;

    @Column(name = "meter_type", nullable = false, length = 30)
    private String meterType = "SMART"; // SINGLE_PHASE, THREE_PHASE, SMART, PREPAID

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, FAULTY, REPLACED

    @Column(name = "installed_at")
    private LocalDate installedAt = LocalDate.now();

    public Meter() {}

    public Meter(String meterNumber, Consumer consumer, Long currentReading, Long previousReading, String meterType) {
        this.meterNumber = meterNumber;
        this.consumer = consumer;
        this.currentReading = currentReading;
        this.previousReading = previousReading;
        this.meterType = meterType;
        this.status = "ACTIVE";
        this.installedAt = LocalDate.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMeterNumber() { return meterNumber; }
    public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }

    public Consumer getConsumer() { return consumer; }
    public void setConsumer(Consumer consumer) { this.consumer = consumer; }

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
