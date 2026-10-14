package com.smartbilling.service;

import com.smartbilling.dto.ConsumerCreateRequest;
import com.smartbilling.dto.ConsumerDto;
import com.smartbilling.entity.Consumer;
import com.smartbilling.entity.Meter;
import com.smartbilling.exception.ResourceNotFoundException;
import com.smartbilling.repository.ConsumerRepository;
import com.smartbilling.repository.MeterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ConsumerService {

    private final ConsumerRepository consumerRepository;
    private final MeterRepository meterRepository;

    public ConsumerService(ConsumerRepository consumerRepository, MeterRepository meterRepository) {
        this.consumerRepository = consumerRepository;
        this.meterRepository = meterRepository;
    }

    public List<ConsumerDto> getAllConsumers() {
        return consumerRepository.findAll().stream()
            .map(this::mapToDto)
            .toList();
    }

    public ConsumerDto getConsumerById(Long id) {
        Consumer consumer = consumerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Consumer not found with id: " + id));
        return mapToDto(consumer);
    }

    public ConsumerDto getConsumerByCode(String consumerId) {
        Consumer consumer = consumerRepository.findByConsumerId(consumerId)
            .orElseThrow(() -> new ResourceNotFoundException("Consumer not found with ID: " + consumerId));
        return mapToDto(consumer);
    }

    @Transactional
    public ConsumerDto createConsumer(ConsumerCreateRequest req) {
        if (consumerRepository.existsByConsumerId(req.getConsumerId())) {
            throw new IllegalArgumentException("Consumer ID already exists: " + req.getConsumerId());
        }

        Consumer consumer = new Consumer(
            req.getConsumerId(),
            req.getName(),
            req.getEmail(),
            req.getPhone(),
            req.getAddress(),
            req.getConnectionType()
        );
        if (req.getSanctionedLoad() != null) {
            consumer.setSanctionedLoad(req.getSanctionedLoad());
        }

        Consumer saved = consumerRepository.save(consumer);
        return mapToDto(saved);
    }

    public ConsumerDto mapToDto(Consumer consumer) {
        ConsumerDto dto = new ConsumerDto();
        dto.setId(consumer.getId());
        dto.setConsumerId(consumer.getConsumerId());
        dto.setName(consumer.getName());
        dto.setEmail(consumer.getEmail());
        dto.setPhone(consumer.getPhone());
        dto.setAddress(consumer.getAddress());
        dto.setConnectionType(consumer.getConnectionType());
        dto.setStatus(consumer.getStatus());
        dto.setSanctionedLoad(consumer.getSanctionedLoad());
        dto.setCreatedAt(consumer.getCreatedAt());

        // Find primary meter if available
        List<Meter> meters = meterRepository.findByConsumerId(consumer.getId());
        if (!meters.isEmpty()) {
            dto.setMeterNumber(meters.get(0).getMeterNumber());
        }

        return dto;
    }
}
