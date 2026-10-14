package com.smartbilling.service;

import com.smartbilling.dto.TariffSlabDto;
import com.smartbilling.entity.TariffSlab;
import com.smartbilling.repository.TariffSlabRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TariffService {

    private final TariffSlabRepository tariffSlabRepository;

    public TariffService(TariffSlabRepository tariffSlabRepository) {
        this.tariffSlabRepository = tariffSlabRepository;
    }

    public List<TariffSlabDto> getAllTariffs() {
        return tariffSlabRepository.findAll().stream()
            .map(this::mapToDto)
            .toList();
    }

    public List<TariffSlabDto> getTariffsByCategory(String connectionType) {
        return tariffSlabRepository.findByConnectionTypeIgnoreCaseOrderBySlabFromAsc(connectionType).stream()
            .map(this::mapToDto)
            .toList();
    }

    public List<TariffSlab> getActiveTariffEntitiesByCategory(String connectionType) {
        return tariffSlabRepository.findByConnectionTypeIgnoreCaseAndStatusIgnoreCaseOrderBySlabFromAsc(connectionType, "ACTIVE");
    }

    public TariffSlabDto mapToDto(TariffSlab slab) {
        TariffSlabDto dto = new TariffSlabDto();
        dto.setId(slab.getId());
        dto.setName(slab.getName());
        dto.setConnectionType(slab.getConnectionType());
        dto.setSlabFrom(slab.getSlabFrom());
        dto.setSlabTo(slab.getSlabTo());
        dto.setRatePerUnit(slab.getRatePerUnit());
        dto.setFixedCharge(slab.getFixedCharge());
        dto.setStatus(slab.getStatus());
        dto.setEffectiveFrom(slab.getEffectiveFrom());
        dto.setEffectiveTo(slab.getEffectiveTo());
        return dto;
    }
}
