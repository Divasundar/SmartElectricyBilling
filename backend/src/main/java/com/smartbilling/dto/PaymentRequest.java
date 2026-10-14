package com.smartbilling.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class PaymentRequest {

    private Long billId;
    private String billNumber;

    private BigDecimal amount;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // UPI, CARD, NET_BANKING, CASH

    private String remarks;

    public PaymentRequest() {}

    public Long getBillId() { return billId; }
    public void setBillId(Long billId) { this.billId = billId; }

    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
