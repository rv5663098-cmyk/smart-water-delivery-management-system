package com.smartwater.backend.controller;

import com.smartwater.backend.entity.WaterProduct;
import com.smartwater.backend.service.WaterProductService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class WaterProductController {

    private final WaterProductService waterProductService;

    public WaterProductController(WaterProductService waterProductService) {
        this.waterProductService = waterProductService;
    }

    @PostMapping
    public WaterProduct createProduct(
            @Valid @RequestBody WaterProduct product) {

        return waterProductService.saveProduct(product);
    }

    @GetMapping
    public List<WaterProduct> getAllProducts() {
        return waterProductService.getAllProducts();
    }

    @GetMapping("/{id}")
    public WaterProduct getProductById(@PathVariable Long id) {
        return waterProductService.getProductById(id);
    }

    @PutMapping("/{id}")
    public WaterProduct updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody WaterProduct product) {

        WaterProduct existingProduct =
                waterProductService.getProductById(id);

        if (existingProduct == null) {
            return null;
        }

        existingProduct.setProductName(product.getProductName());
        existingProduct.setSizeInLiters(product.getSizeInLiters());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setAvailable(product.isAvailable());

        return waterProductService.saveProduct(existingProduct);
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        waterProductService.deleteProduct(id);
        return "Water product deleted successfully";
    }
}