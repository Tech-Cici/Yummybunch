package com.backend.Yummybunch.dto;

import com.backend.Yummybunch.model.Review;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewDTO {
    private Long id;
    private Long restaurantId;
    private Long customerId;
    private String customerName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReviewDTO fromEntity(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setRestaurantId(review.getRestaurant().getId());
        dto.setCustomerId(review.getCustomer().getId());
        dto.setCustomerName(review.getCustomer().getUser().getName());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());
        return dto;
    }
} 