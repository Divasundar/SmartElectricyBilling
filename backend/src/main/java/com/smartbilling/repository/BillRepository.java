package com.smartbilling.repository;

import com.smartbilling.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByBillNumber(String billNumber);
    List<Bill> findByConsumerIdOrderByCreatedAtDesc(Long consumerId);
    List<Bill> findByConsumerConsumerIdOrderByCreatedAtDesc(String consumerId);
    boolean existsByConsumerConsumerIdAndBillingPeriodIgnoreCase(String consumerId, String billingPeriod);
    boolean existsByConsumerIdAndBillingPeriodIgnoreCase(Long consumerId, String billingPeriod);
}
