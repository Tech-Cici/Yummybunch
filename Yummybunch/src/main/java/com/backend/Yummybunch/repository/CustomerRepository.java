package com.backend.Yummybunch.repository;

import com.backend.Yummybunch.model.Customer;
import com.backend.Yummybunch.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUser(User user);
    Optional<Customer> findByUserEmail(String email);
    boolean existsByUser(User user);
} 