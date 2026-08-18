package com.backend.Yummybunch.repo;

import com.backend.Yummybunch.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    Optional<Restaurant> findByOwnerId(Long ownerId);

    Optional<Restaurant> findByOwnerEmailIgnoreCase(String email);

    /**
     * Free-text search plus optional cuisine filter. A null or blank argument is
     * ignored, so search(null, null) returns everything ordered by name.
     */
    @Query("""
           SELECT r FROM Restaurant r
           WHERE (:q IS NULL OR :q = ''
                  OR LOWER(r.name)                  LIKE LOWER(CONCAT('%', :q, '%'))
                  OR LOWER(COALESCE(r.cuisine, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                  OR LOWER(COALESCE(r.address, '')) LIKE LOWER(CONCAT('%', :q, '%')))
             AND (:cuisine IS NULL OR :cuisine = '' OR LOWER(r.cuisine) = LOWER(:cuisine))
           ORDER BY r.name ASC
           """)
    List<Restaurant> search(@Param("q") String q, @Param("cuisine") String cuisine);

    @Query("""
           SELECT DISTINCT TRIM(r.cuisine) FROM Restaurant r
           WHERE r.cuisine IS NOT NULL AND TRIM(r.cuisine) <> ''
           ORDER BY TRIM(r.cuisine) ASC
           """)
    List<String> findDistinctCuisines();
}
