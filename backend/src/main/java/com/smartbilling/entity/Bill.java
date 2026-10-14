package com.smartbilling.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "bills",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_consumer_billing_period",
            columnNames = {"consumer_id", "billing_period"}
        )
    }
)
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_number", nullable = false, unique = true, length = 50)
    private String billNumber; // e.g. "BILL-2026-000001"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consumer_id", nullable = false)
    private Consumer consumer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "meter_id", nullable = false)
    private Meter meter;

    @Column(name = "billing_period", nullable = false, length = 50)
    private String billingPeriod; // e.g. "October 2026"

    @Column(name = "previous_reading", nullable = false)
    private Long previousReading;

    @Column(name = "current_reading", nullable = false)
    private Long currentReading;

    @Column(name = "units_consumed", nullable = false)
    private Long unitsConsumed;

    @Column(name = "energy_charges", nullable = false, precision = 12, scale = 2)
    private BigDecimal energyCharges;

    @Column(name = "fixed_charge", nullable = false, precision = 12, scale = 2)
    private BigDecimal fixedCharge;

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRate; // 0.10

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal tax;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal surcharge = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 30)
    private String status = "UNPAID"; // UNPAID, PAID, OVERDUE, PARTIALLY_PAID, CANCELLED

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BillSlabBreakdown> slabBreakdowns = new ArrayList<>();

    public Bill() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }

    public Consumer getConsumer() { return consumer; }
    public void setConsumer(Consumer consumer) { this.consumer = consumer; }

    public Meter getMeter() { return meter; }
    public void setMeter(Meter meter) { this.meter = meter; }

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

    public List<BillSlabBreakdown> getSlabBreakdowns() { return slabBreakdowns; }
    public void setSlabBreakdowns(List<BillSlabBreakdown> slabBreakdowns) { this.slabBreakdowns = slabBreakdowns; }

    public void addSlabBreakdown(BillSlabBreakdown breakdown) {
        slabBreakdowns.add(breakdown);
        breakdown.setBill(this);
    }
}
