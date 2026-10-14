package com.smartbilling.service;

import com.smartbilling.dto.PaymentRequest;
import com.smartbilling.dto.PaymentResponse;
import com.smartbilling.entity.Bill;
import com.smartbilling.entity.Payment;
import com.smartbilling.exception.BillAlreadyPaidException;
import com.smartbilling.exception.ResourceNotFoundException;
import com.smartbilling.repository.BillRepository;
import com.smartbilling.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;

    public PaymentService(PaymentRepository paymentRepository, BillRepository billRepository) {
        this.paymentRepository = paymentRepository;
        this.billRepository = billRepository;
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllByOrderByPaidAtDesc().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional
    public PaymentResponse recordDemoPayment(PaymentRequest req) {
        Bill bill = null;
        if (req.getBillId() != null) {
            bill = billRepository.findById(req.getBillId()).orElse(null);
        }
        if (bill == null && req.getBillNumber() != null) {
            bill = billRepository.findByBillNumber(req.getBillNumber()).orElse(null);
        }

        if (bill == null) {
            throw new ResourceNotFoundException("Bill not found for payment processing.");
        }

        if ("PAID".equalsIgnoreCase(bill.getStatus())) {
            throw new BillAlreadyPaidException("This bill is already paid in full.");
        }

        BigDecimal amount = req.getAmount() != null ? req.getAmount() : bill.getTotalAmount();
        String method = req.getPaymentMethod() != null ? req.getPaymentMethod().toUpperCase() : "UPI";

        // Generate demo transaction ID
        String txId = "TXN-DEMO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = new Payment(
            txId,
            bill,
            amount,
            method,
            "SUCCESS",
            req.getRemarks() != null ? req.getRemarks() : "Demo payment via Consumer Portal"
        );
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        // Update Bill status to PAID
        bill.setStatus("PAID");
        billRepository.save(bill);

        return mapToResponse(savedPayment);
    }

    public PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setTransactionId(payment.getTransactionId());
        if (payment.getBill() != null) {
            response.setBillId(payment.getBill().getId());
            response.setBillNumber(payment.getBill().getBillNumber());
            if (payment.getBill().getConsumer() != null) {
                response.setConsumerId(payment.getBill().getConsumer().getConsumerId());
                response.setConsumerName(payment.getBill().getConsumer().getName());
            }
        }
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setStatus(payment.getStatus());
        response.setPaidAt(payment.getPaidAt());
        response.setRemarks(payment.getRemarks());
        return response;
    }
}
