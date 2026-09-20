package com.smartwater.backend.service;

import com.smartwater.backend.entity.Delivery;
import com.smartwater.backend.entity.Order;
import com.smartwater.backend.repository.DeliveryRepository;
import com.smartwater.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;

    public DeliveryService(
            DeliveryRepository deliveryRepository,
            OrderRepository orderRepository) {
        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
    }

    // Create Delivery
    public Delivery saveDelivery(Delivery delivery) {

        Order order = orderRepository.findById(delivery.getOrder().getId())
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        delivery.setOrder(order);

        if (delivery.getStatus() == null || delivery.getStatus().isBlank()) {
            delivery.setStatus("ASSIGNED");
        }

        return deliveryRepository.save(delivery);
    }

    // Get All Deliveries
    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    // Get Delivery By ID
    public Delivery getDeliveryById(Long id) {
    return deliveryRepository.findById(id)
        .orElseThrow(() ->
            new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Delivery not found with id: " + id
            ));
}

    // Update Delivery Status
    public Delivery updateDeliveryStatus(Long id, String status) {

        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Delivery not found with id: " + id));

        delivery.setStatus(status);

        return deliveryRepository.save(delivery);
    }

    // Delete Delivery
    public void deleteDelivery(Long id) {
        deliveryRepository.deleteById(id);
    }
}
