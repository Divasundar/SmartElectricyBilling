package com.smartbilling.repository;

import com.smartbilling.entity.Meter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeterRepository extends JpaRepository<Meter, Long> {
    Optional<Meter> findByMeterNumber(String meterNumber);
    List<Meter> findByConsumerId(Long consumerId);
    List<Meter> findByConsumerConsumerId(String consumerId);
}
