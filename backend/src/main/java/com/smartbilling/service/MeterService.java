package com.smartbilling.service;

import com.smartbilling.dto.MeterDto;
import com.smartbilling.entity.Meter;
import com.smartbilling.exception.ResourceNotFoundException;
import com.smartbilling.repository.MeterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MeterService {

    private final MeterRepository meterRepository;

    public MeterService(MeterRepository meterRepository) {
        this.meterRepository = meterRepository;
    }

    public List<MeterDto> getAllMeters() {
        return meterRepository.findAll().stream()
            .map(this::mapToDto)
            .toList();
    }

    public MeterDto getMeterById(Long id) {
        Meter meter = meterRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Meter not found with id: " + id));
        return mapToDto(meter);
    }

    public List<MeterDto> getMetersByConsumerCode(String consumerId) {
        return meterRepository.findByConsumerConsumerId(consumerId).stream()
            .map(this::mapToDto)
            .toList();
    }

    public MeterDto mapToDto(Meter meter) {
        MeterDto dto = new MeterDto();
        dto.setId(meter.getId());
        dto.setMeterNumber(meter.getMeterNumber());
        if (meter.getConsumer() != null) {
            dto.setConsumerId(meter.getConsumer().getId());
            dto.setConsumerCode(meter.getConsumer().getConsumerId());
            dto.setConsumerName(meter.getConsumer().getName());
        }
        dto.setCurrentReading(meter.getCurrentReading());
        dto.setPreviousReading(meter.getPreviousReading());
        dto.setMeterType(meter.getMeterType());
        dto.setStatus(meter.getStatus());
        dto.setInstalledAt(meter.getInstalledAt());
        return dto;
    }
}
