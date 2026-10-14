package com.smartbilling.repository;

import com.smartbilling.entity.ConsumptionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsumptionRecordRepository extends JpaRepository<ConsumptionRecord, Long> {
    List<ConsumptionRecord> findByConsumerIdOrderByYearAscMonthAsc(String consumerId);
}
