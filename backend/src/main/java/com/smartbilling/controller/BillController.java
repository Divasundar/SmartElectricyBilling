package com.smartbilling.controller;

import com.smartbilling.billing.SlabBreakdownResult;
import com.smartbilling.dto.BillCalculationRequest;
import com.smartbilling.dto.BillCalculationResponse;
import com.smartbilling.dto.BillGenerationRequest;
import com.smartbilling.dto.BillResponse;
import com.smartbilling.service.BillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping("/bills")
    public ResponseEntity<List<BillResponse>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @GetMapping("/bills/{id}")
    public ResponseEntity<BillResponse> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    @GetMapping("/consumers/{consumerId}/bills")
    public ResponseEntity<List<BillResponse>> getBillsByConsumer(@PathVariable String consumerId) {
        return ResponseEntity.ok(billService.getBillsByConsumer(consumerId));
    }

    @PostMapping("/bills/calculate-preview")
    public ResponseEntity<BillCalculationResponse> calculatePreview(@Valid @RequestBody BillCalculationRequest req) {
        return ResponseEntity.ok(billService.calculatePreview(req));
    }

    @PostMapping("/bills/generate")
    public ResponseEntity<BillResponse> generateBill(@Valid @RequestBody BillGenerationRequest req) {
        BillResponse generated = billService.generateBill(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(generated);
    }

    @GetMapping("/bills/{id}/breakdown")
    public ResponseEntity<List<SlabBreakdownResult>> getBillBreakdown(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillBreakdown(id));
    }

    @PatchMapping("/bills/{id}/status")
    public ResponseEntity<BillResponse> updateBillStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(billService.updateBillStatus(id, status));
    }
}
