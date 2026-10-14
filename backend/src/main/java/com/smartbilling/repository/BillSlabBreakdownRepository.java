package com.smartbilling.repository;

import com.smartbilling.entity.BillSlabBreakdown;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillSlabBreakdownRepository extends JpaRepository<BillSlabBreakdown, Long> {
    List<BillSlabBreakdown> findByBillId(Long billId);
}
