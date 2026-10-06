package com.smartwater.backend.service;

import com.smartwater.backend.entity.Customer;
import com.smartwater.backend.entity.Order;
import com.smartwater.backend.entity.WaterProduct;
import com.smartwater.backend.repository.OrderRepository;
import com.smartwater.backend.exception.OrderNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public Order saveOrder(Order order) {

        // Get Customer using customerId
        Customer customer =
                customerService.getCustomerById(order.getCustomerId());

        if (!customer.isActive()) {
    throw new RuntimeException(
            "Cannot create order for an inactive customer"
    );
}

        // Get Product using productId
        WaterProduct product =
                waterProductService.getProductById(order.getProductId());

        // Check product exists
        if (product == null) {
            throw new RuntimeException(
                    "Water product not found with id: " + order.getProductId());
        }
           
        // Check stock availability
if (product.getStockQuantity() < order.getQuantity()) {
    throw new RuntimeException(
            "Insufficient stock. Available stock: "
                    + product.getStockQuantity()
    );
}

        if (!product.isAvailable()) {
    throw new RuntimeException(
            "Cannot create order for an unavailable water product"
    );
}

        // Set Customer and Product
        order.setCustomer(customer);
        order.setProduct(product);

// Calculate total amount
double totalAmount =
        product.getPrice() * order.getQuantity();

order.setTotalAmount(totalAmount);

// Deduct stock
int remainingStock =
        product.getStockQuantity() - order.getQuantity();

waterProductService.updateStock(
        product.getId(),
        remainingStock
);


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
   
@Transactional
public void deleteOrder(Long id) {

    Order order = orderRepository.findById(id)
            .orElseThrow(() ->
                    new OrderNotFoundException(
                            "Order not found with id: " + id));

    // Restore stock only if order was not already cancelled
    if (!"CANCELLED".equalsIgnoreCase(order.getStatus())) {

        WaterProduct product = order.getProduct();

        int restoredStock =
                product.getStockQuantity() + order.getQuantity();

        waterProductService.updateStock(
                product.getId(),
                restoredStock
        );
    }

    orderRepository.delete(order);
}


    // Update Order Status
@Transactional
public Order updateOrderStatus(Long id, String status) {

    Order order = orderRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Order not found"));

    String oldStatus = order.getStatus();

    // Restore stock only when order is cancelled for the first time
    if (!"CANCELLED".equalsIgnoreCase(oldStatus)
            && "CANCELLED".equalsIgnoreCase(status)) {

        WaterProduct product = order.getProduct();

        int restoredStock =
                product.getStockQuantity() + order.getQuantity();

        waterProductService.updateStock(
                product.getId(),
                restoredStock
        );
    }

    order.setStatus(status);

    return orderRepository.save(order);
}

}