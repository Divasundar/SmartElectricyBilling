package com.smartbilling.controller;

import com.smartbilling.dto.ConsumerCreateRequest;
import com.smartbilling.dto.ConsumerDto;
import com.smartbilling.service.ConsumerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consumers")
public class ConsumerController {

    private final ConsumerService consumerService;

    public ConsumerController(ConsumerService consumerService) {
        this.consumerService = consumerService;
    }

    @GetMapping
    public ResponseEntity<List<ConsumerDto>> getAllConsumers() {
        return ResponseEntity.ok(consumerService.getAllConsumers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsumerDto> getConsumerById(@PathVariable String id) {
        // Support lookup by numeric ID or string consumer code (e.g. C10234)
        try {
            Long numericId = Long.parseLong(id);
            return ResponseEntity.ok(consumerService.getConsumerById(numericId));
        } catch (NumberFormatException e) {
            return ResponseEntity.ok(consumerService.getConsumerByCode(id));
        }
    }

    @PostMapping
    public ResponseEntity<ConsumerDto> createConsumer(@Valid @RequestBody ConsumerCreateRequest req) {
        ConsumerDto created = consumerService.createConsumer(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
