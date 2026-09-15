package com.smartwater.backend.controller;

import com.smartwater.backend.entity.Customer;
import com.smartwater.backend.service.CustomerService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
public Customer createCustomer(
        @Valid @RequestBody Customer customer) {

    return customerService.saveCustomer(customer);
}
     
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @GetMapping("/{id}")
    public Customer getCustomerById(@PathVariable Long id) {
        return customerService.getCustomerById(id);
    }
    @PutMapping("/{id}")
public Customer updateCustomer(@PathVariable Long id,  @Valid @RequestBody Customer customer) {
    Customer existingCustomer = customerService.getCustomerById(id);

    if (existingCustomer == null) {
        return null;
    }

    existingCustomer.setName(customer.getName());
    existingCustomer.setMobile(customer.getMobile());
    existingCustomer.setEmail(customer.getEmail());
    existingCustomer.setAddress(customer.getAddress());

    return customerService.saveCustomer(existingCustomer);
}

    @DeleteMapping("/{id}")
    public String deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return "Customer deleted successfully";
    }
}