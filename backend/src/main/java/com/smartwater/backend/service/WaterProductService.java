package com.smartwater.backend.service;

import com.smartwater.backend.entity.WaterProduct;
import com.smartwater.backend.repository.WaterProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WaterProductService {

    private final WaterProductRepository waterProductRepository;

    public WaterProductService(WaterProductRepository waterProductRepository) {
        this.waterProductRepository = waterProductRepository;
    }

    public WaterProduct saveProduct(WaterProduct product) {
        return waterProductRepository.save(product);
    }

    public List<WaterProduct> getAllProducts() {
        return waterProductRepository.findAll();
    }

    public WaterProduct getProductById(Long id) {
        return waterProductRepository.findById(id).orElse(null);
    }

    public void deleteProduct(Long id) {
        waterProductRepository.deleteById(id);
    }
}