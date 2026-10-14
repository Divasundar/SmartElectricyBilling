package com.smartbilling.controller;

import com.smartbilling.dto.MeterDto;
import com.smartbilling.service.MeterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meters")
public class MeterController {

    private final MeterService meterService;

    public MeterController(MeterService meterService) {
        this.meterService = meterService;
    }

    @GetMapping
    public ResponseEntity<List<MeterDto>> getAllMeters() {
        return ResponseEntity.ok(meterService.getAllMeters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeterDto> getMeterById(@PathVariable Long id) {
        return ResponseEntity.ok(meterService.getMeterById(id));
    }
}
