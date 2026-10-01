package com.smartwater.backend.service;

import com.smartwater.backend.entity.Customer;
import com.smartwater.backend.exception.CustomerNotFoundException;
import com.smartwater.backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer saveCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
    }

 public Customer deactivateCustomer(Long id) {
    Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new CustomerNotFoundException(id));

    customer.setActive(false);

    return customerRepository.save(customer);
}
  public Customer activateCustomer(Long id) {
    Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new CustomerNotFoundException(id));

    customer.setActive(true);

    return customerRepository.save(customer);
}

}