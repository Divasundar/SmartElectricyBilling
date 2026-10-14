package com.smartbilling.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {
    private Long id;
    private String transactionId;
    private Long billId;
    private String billNumber;
    private String consumerId;
    private String consumerName;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private LocalDateTime paidAt;
    private String remarks;

    public PaymentResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public Long getBillId() { return billId; }
    public void setBillId(Long billId) { this.billId = billId; }

    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }

    public String getConsumerId() { return consumerId; }
    public void setConsumerId(String consumerId) { this.consumerId = consumerId; }

    public String getConsumerName() { return consumerName; }
    public void setConsumerName(String consumerName) { this.consumerName = consumerName; }

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
