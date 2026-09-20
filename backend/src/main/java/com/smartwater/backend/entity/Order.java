package com.smartwater.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Customer customer;

    @ManyToOne
    private WaterProduct product;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;

    private Double totalAmount;

    private String status;
    @Transient
@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
private Long customerId;

@Transient
@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
private Long productId;

    public Order() {
    }

    public Order(Customer customer, WaterProduct product, int quantity,
                 double totalAmount, String status) {
        this.customer = customer;
        this.product = product;
        this.quantity = quantity;
        this.totalAmount = totalAmount;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public WaterProduct getProduct() {
        return product;
    }

    public void setProduct(WaterProduct product) {
        this.product = product;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCustomerId() {
    return customerId;
}

public void setCustomerId(Long customerId) {
    this.customerId = customerId;
}

public Long getProductId() {
    return productId;
}

public void setProductId(Long productId) {
    this.productId = productId;
}

}
