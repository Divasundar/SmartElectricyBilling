package com.smartbilling.controller;

import com.smartbilling.dto.TariffSlabDto;
import com.smartbilling.service.TariffService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tariffs")
public class TariffController {

    private final TariffService tariffService;

    public TariffController(TariffService tariffService) {
        this.tariffService = tariffService;
    }

    @GetMapping
    public ResponseEntity<List<TariffSlabDto>> getAllTariffs() {
        return ResponseEntity.ok(tariffService.getAllTariffs());
    }

    @GetMapping("/{connectionType}")
    public ResponseEntity<List<TariffSlabDto>> getTariffsByCategory(@PathVariable String connectionType) {
        return ResponseEntity.ok(tariffService.getTariffsByCategory(connectionType));
    }
}
