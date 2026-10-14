package com.smartbilling.repository;

import com.smartbilling.entity.Consumer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsumerRepository extends JpaRepository<Consumer, Long> {
    Optional<Consumer> findByConsumerId(String consumerId);
    boolean existsByConsumerId(String consumerId);
}
