package com.smartwater.backend.controller;

import com.smartwater.backend.entity.Delivery;
import com.smartwater.backend.service.DeliveryService;
import org.springframework.http.HttpStatus;
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
    @ResponseStatus(HttpStatus.CREATED)
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

    // Update Delivery Status
    @PutMapping("/{id}/status")
    public Delivery updateDeliveryStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return deliveryService.updateDeliveryStatus(id, status);
    }

    // Delete Delivery
    @DeleteMapping("/{id}")
    public String deleteDelivery(@PathVariable Long id) {
        deliveryService.deleteDelivery(id);
        return "Delivery deleted successfully";
    }
}
