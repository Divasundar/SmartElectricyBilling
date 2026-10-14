package com.smartbilling.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false, unique = true, length = 100)
    private String transactionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod; // UPI, CARD, NET_BANKING, CASH

    @Column(nullable = false, length = 20)
    private String status = "SUCCESS"; // SUCCESS, PENDING, FAILED

    @Column(name = "paid_at", nullable = false)
    private LocalDateTime paidAt = LocalDateTime.now();

    @Column(length = 255)
    private String remarks;

    public Payment() {}

    public Payment(String transactionId, Bill bill, BigDecimal amount, String paymentMethod, String status, String remarks) {
        this.transactionId = transactionId;
        this.bill = bill;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.paidAt = LocalDateTime.now();
        this.remarks = remarks;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public Bill getBill() { return bill; }
    public void setBill(Bill bill) { this.bill = bill; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
