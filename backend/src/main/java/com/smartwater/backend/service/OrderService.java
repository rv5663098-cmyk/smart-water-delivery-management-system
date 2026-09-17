package com.smartwater.backend.service;

import com.smartwater.backend.entity.Order;
import com.smartwater.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;
import com.smartwater.backend.exception.OrderNotFoundException;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
       return orderRepository.findById(id)
        .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    public Order updateOrderStatus(Long id, String status) {

    Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));

    order.setStatus(status);

    return orderRepository.save(order);
}
}