package com.smartwater.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
public class WaterProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    private String productName;

    @Positive(message = "Size must be greater than 0")
    private double sizeInLiters;

    @Positive(message = "Price must be greater than 0")
    private double price;

    private boolean available;

    @PositiveOrZero(message = "Stock quantity cannot be negative")
private int stockQuantity;

    public WaterProduct() {
    }

public WaterProduct(String productName, double sizeInLiters,
                    double price, boolean available) {
    this.productName = productName;
    this.sizeInLiters = sizeInLiters;
    this.price = price;
    this.available = available;
    this.stockQuantity = 0;
}

    public Long getId() {
        return id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public double getSizeInLiters() {
        return sizeInLiters;
    }

    public void setSizeInLiters(double sizeInLiters) {
        this.sizeInLiters = sizeInLiters;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public int getStockQuantity() {
    return stockQuantity;
}

public void setStockQuantity(int stockQuantity) {
    this.stockQuantity = stockQuantity;
}
}