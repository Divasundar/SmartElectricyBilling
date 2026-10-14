package com.smartbilling.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "consumption_records")
public class ConsumptionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consumer_id", nullable = false, length = 50)
    private String consumerId;

    @Column(nullable = false, length = 20)
    private String month; // e.g. "Jan", "Feb"

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Long units;

    @Column(name = "recorded_at", nullable = false)
    private LocalDate recordedAt = LocalDate.now();

    public ConsumptionRecord() {}

    public ConsumptionRecord(String consumerId, String month, Integer year, Long units) {
        this.consumerId = consumerId;
        this.month = month;
        this.year = year;
        this.units = units;
        this.recordedAt = LocalDate.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getConsumerId() { return consumerId; }
    public void setConsumerId(String consumerId) { this.consumerId = consumerId; }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Long getUnits() { return units; }
    public void setUnits(Long units) { this.units = units; }

    public LocalDate getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDate recordedAt) { this.recordedAt = recordedAt; }
}
