package com.smartwater.backend.controller;

import com.smartwater.backend.entity.Delivery;
import com.smartwater.backend.service.DeliveryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    // Create Delivery
    @PostMapping
    public Delivery createDelivery(@RequestBody Delivery delivery) {
        return deliveryService.saveDelivery(delivery);
    }

    // Get All Deliveries
    @GetMapping
    public List<Delivery> getAllDeliveries() {
        return deliveryService.getAllDeliveries();
    }

    // Get Delivery By ID
    @GetMapping("/{id}")
    public Delivery getDeliveryById(@PathVariable Long id) {
        return deliveryService.getDeliveryById(id);
    }

    // Delete Delivery
    @DeleteMapping("/{id}")
    public String deleteDelivery(@PathVariable Long id) {
        deliveryService.deleteDelivery(id);
        return "Delivery deleted successfully";
    }

    // Update Delivery Status
@PutMapping("/{id}/status")
public Delivery updateDeliveryStatus(
        @PathVariable Long id,
        @RequestParam String status) {

    Delivery delivery = deliveryService.getDeliveryById(id);

    if (delivery == null) {
        return null;
    }

    delivery.setStatus(status);

    return deliveryService.saveDelivery(delivery);
}

}