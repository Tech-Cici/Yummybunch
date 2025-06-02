package com.backend.Yummybunch.dto;

import com.backend.Yummybunch.model.Customer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private String deliveryInstructions;
    private String deliveryPreferences;
    private int loyaltyPoints;

    public static CustomerDTO fromEntity(Customer customer) {
        if (customer == null) return null;
        
        CustomerDTO dto = new CustomerDTO();
        dto.setId(customer.getId());
        dto.setName(customer.getUser().getName());
        dto.setEmail(customer.getUser().getEmail());
        dto.setPhoneNumber(customer.getUser().getPhoneNumber());
        dto.setAddress(customer.getAddress());
        dto.setDeliveryInstructions(customer.getDeliveryInstructions());
        dto.setDeliveryPreferences(customer.getDeliveryPreferences());
        dto.setLoyaltyPoints(customer.getLoyaltyPoints());
        return dto;
    }
} 