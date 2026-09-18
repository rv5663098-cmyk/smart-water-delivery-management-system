package com.smartwater.backend.service;

import com.smartwater.backend.entity.Customer;
import com.smartwater.backend.entity.Order;
import com.smartwater.backend.entity.WaterProduct;
import com.smartwater.backend.repository.OrderRepository;
import com.smartwater.backend.exception.OrderNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerService customerService;
    private final WaterProductService waterProductService;

    public OrderService(
            OrderRepository orderRepository,
            CustomerService customerService,
            WaterProductService waterProductService) {

        this.orderRepository = orderRepository;
        this.customerService = customerService;
        this.waterProductService = waterProductService;
    }

    // Create Order
    public Order saveOrder(Order order) {

        // Get Customer using customerId
        Customer customer =
                customerService.getCustomerById(order.getCustomerId());

        // Get Product using productId
        WaterProduct product =
                waterProductService.getProductById(order.getProductId());

        // Check product exists
        if (product == null) {
            throw new RuntimeException(
                    "Water product not found with id: " + order.getProductId());
        }

        // Set Customer and Product
        order.setCustomer(customer);
        order.setProduct(product);

        // Calculate total amount
        double totalAmount =
                product.getPrice() * order.getQuantity();

        order.setTotalAmount(totalAmount);

        // Default status
        if (order.getStatus() == null || order.getStatus().isBlank()) {
            order.setStatus("PLACED");
        }

        return orderRepository.save(order);
    }

    // Get All Orders
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Get Order By ID
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new OrderNotFoundException(
                                "Order not found with id: " + id));
    }

    // Delete Order
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    // Update Order Status
    public Order updateOrderStatus(Long id, String status) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        order.setStatus(status);

        return orderRepository.save(order);
    }
}