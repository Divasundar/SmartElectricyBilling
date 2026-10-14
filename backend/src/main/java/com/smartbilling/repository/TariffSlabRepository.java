package com.smartbilling.repository;

import com.smartbilling.entity.TariffSlab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TariffSlabRepository extends JpaRepository<TariffSlab, Long> {
    List<TariffSlab> findByConnectionTypeIgnoreCaseAndStatusIgnoreCaseOrderBySlabFromAsc(String connectionType, String status);
    List<TariffSlab> findByConnectionTypeIgnoreCaseOrderBySlabFromAsc(String connectionType);
}
