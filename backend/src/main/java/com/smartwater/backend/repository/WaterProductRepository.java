package com.smartwater.backend.repository;

import com.smartwater.backend.entity.WaterProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WaterProductRepository extends JpaRepository<WaterProduct, Long> {
}