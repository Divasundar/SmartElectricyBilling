package com.smartbilling.controller;

import com.smartbilling.dto.PaymentRequest;
import com.smartbilling.dto.PaymentResponse;
import com.smartbilling.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @PostMapping("/demo")
    public ResponseEntity<PaymentResponse> recordDemoPayment(@Valid @RequestBody PaymentRequest req) {
        PaymentResponse response = paymentService.recordDemoPayment(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
