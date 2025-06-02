package com.backend.Yummybunch.service;

import com.backend.Yummybunch.model.Customer;
import com.backend.Yummybunch.model.User;
import com.backend.Yummybunch.repository.CustomerRepository;
import com.backend.Yummybunch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Customer save(Customer customer) {
        return customerRepository.save(customer);
    }

    public Optional<Customer> findByUserId(Long userId) {
        return userRepository.findById(userId)
            .flatMap(user -> customerRepository.findByUser(user));
    }

    public Optional<Customer> findByEmail(String email) {
        return customerRepository.findByUserEmail(email);
    }

    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    public Optional<Customer> findById(Long id) {
        return customerRepository.findById(id);
    }

    @Transactional
    public void deleteById(Long id) {
        customerRepository.deleteById(id);
    }

    public long count() {
        return customerRepository.count();
    }

    @Transactional
    public Customer createCustomerForUser(User user) {
        if (customerRepository.existsByUser(user)) {
            return customerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Customer record not found for user"));
        }

        Customer customer = new Customer();
        customer.setUser(user);
        customer.setActive(true);
        customer.setLoyaltyPoints(0);
        return customerRepository.save(customer);
    }
} 