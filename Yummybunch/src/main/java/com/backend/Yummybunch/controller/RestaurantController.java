package com.backend.Yummybunch.controller;

import com.backend.Yummybunch.dto.*;
import com.backend.Yummybunch.model.*;
import com.backend.Yummybunch.repository.*;
import com.backend.Yummybunch.service.*;
import com.backend.Yummybunch.security.JwtUtil;
import com.backend.Yummybunch.config.FileStorageConfig;
import com.backend.Yummybunch.dto.ReviewDTO;
import com.backend.Yummybunch.dto.CustomerDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import java.nio.file.Files;
import com.backend.Yummybunch.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class RestaurantController {

    private static final Logger logger = LoggerFactory.getLogger(RestaurantController.class);

    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MenuRepository menuRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private OrderService orderService;
    @Autowired
    private RestaurantService restaurantService;
    @Autowired
    private FileStorageConfig fileStorageConfig;
    @Autowired
    private CustomerService customerService;

    private RestaurantDTO convertToDTO(Restaurant restaurant) {
        return RestaurantDTO.fromEntity(restaurant);
    }

    private ReviewDTO convertToReviewDTO(Review review) {
        return ReviewDTO.fromEntity(review);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getRestaurantDashboard(@RequestHeader("Authorization") String token) {
        try {
            // Get restaurant from token
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            Restaurant restaurant = restaurantRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));

            // Get restaurant's orders
            List<Order> orders = orderRepository.findByRestaurantId(restaurant.getId());
            List<OrderDTO> orderDTOs = orders.stream()
                    .map(OrderDTO::fromEntity)
                    .collect(Collectors.toList());

            // Get restaurant's menu
            List<Menu> menus = menuRepository.findByRestaurantId(restaurant.getId());
            List<MenuDTO> menuDTOs = menus.stream()
                    .map(MenuDTO::fromEntity)
                    .collect(Collectors.toList());

            Map<String, Object> dashboardData = new HashMap<>();
            dashboardData.put("orders", orderDTOs);
            dashboardData.put("menus", menuDTOs);
            dashboardData.put("restaurant", RestaurantDTO.fromEntity(restaurant));

            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            logger.error("Error in dashboard: ", e);
            return ResponseEntity.status(500)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getRestaurantOrders(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            Restaurant restaurant = restaurantRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));

            List<Order> orders = orderRepository.findByRestaurantId(restaurant.getId());
            List<OrderDTO> orderDTOs = orders.stream()
                    .map(OrderDTO::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(orderDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/menu")
    public ResponseEntity<?> getRestaurantMenu(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            Restaurant restaurant = restaurantRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));

            List<Menu> menus = menuRepository.findByRestaurantId(restaurant.getId());
            List<MenuDTO> menuDTOs = menus.stream()
                    .map(MenuDTO::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(menuDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<RestaurantDTO>> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        List<RestaurantDTO> restaurantDTOs = restaurants.stream()
                .map(RestaurantDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurantDTOs);
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            Restaurant restaurant = restaurantRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));

            Map<String, String> settings = new HashMap<>();
            settings.put("name", restaurant.getName());
            settings.put("description", restaurant.getDescription());
            settings.put("address", restaurant.getAddress());
            settings.put("phoneNumber", restaurant.getPhoneNumber());
            settings.put("email", restaurant.getEmail());
            settings.put("openingHours", restaurant.getOpeningHours());
            settings.put("closingHours", restaurant.getClosingHours());
            settings.put("cuisineType", restaurant.getCuisineType());

            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching settings: " + e.getMessage());
        }
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> settings) {
        String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
        Restaurant restaurant = restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

        // Validate required fields
        if (settings.get("name") == null || settings.get("name").trim().isEmpty()) {
            throw new IllegalArgumentException("Restaurant name is required");
        }
        
        // Handle both "phone" and "phoneNumber" field names
        String phoneNumber = settings.get("phoneNumber");
        if (phoneNumber == null) {
            phoneNumber = settings.get("phone");
        }
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        
        if (settings.get("address") == null || settings.get("address").trim().isEmpty()) {
            throw new IllegalArgumentException("Address is required");
        }

        // Update restaurant fields while preserving existing values
        restaurant.setName(settings.get("name"));
        restaurant.setDescription(settings.get("description") != null ? settings.get("description") : restaurant.getDescription());
        restaurant.setAddress(settings.get("address"));
        restaurant.setPhoneNumber(phoneNumber);
        restaurant.setEmail(settings.get("email") != null ? settings.get("email") : restaurant.getEmail());
        restaurant.setOpeningHours(settings.get("openingHours") != null ? settings.get("openingHours") : restaurant.getOpeningHours());
        restaurant.setClosingHours(settings.get("closingHours") != null ? settings.get("closingHours") : restaurant.getClosingHours());
        restaurant.setCuisineType(settings.get("cuisineType") != null ? settings.get("cuisineType") : restaurant.getCuisineType());

        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(RestaurantDTO.fromEntity(updatedRestaurant));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentRestaurant(@RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or missing token"));
            }

            String cleanToken = token.replace("Bearer ", "");
            String email = jwtUtil.extractUsername(cleanToken);
            
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Could not extract email from token"));
            }

            System.out.println("Looking for restaurant with email: " + email);
            Optional<Restaurant> restaurantOpt = restaurantRepository.findByEmail(email);
            
            if (restaurantOpt.isEmpty()) {
                System.out.println("No restaurant found for email: " + email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Restaurant not found for email: " + email));
            }

            Restaurant restaurant = restaurantOpt.get();
            System.out.println("Found restaurant: " + restaurant.getName() + " (ID: " + restaurant.getId() + ")");
            return ResponseEntity.ok(RestaurantDTO.fromEntity(restaurant));
        } catch (Exception e) {
            System.err.println("Error in getCurrentRestaurant: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error processing request: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRestaurant(@PathVariable Long id) {
        try {
            Restaurant restaurant = restaurantRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
            return ResponseEntity.ok(convertToDTO(restaurant));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching restaurant: " + e.getMessage()));
        }
    }

    @GetMapping("/cuisine/{cuisineType}")
    public ResponseEntity<List<RestaurantDTO>> getRestaurantsByCuisine(@PathVariable String cuisineType) {
        List<Restaurant> restaurants = restaurantRepository.findByCuisineType(cuisineType);
        List<RestaurantDTO> restaurantDTOs = restaurants.stream()
                .map(RestaurantDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurantDTOs);
    }

    @GetMapping("/search")
    public ResponseEntity<List<RestaurantDTO>> searchRestaurants(@RequestParam String name) {
        List<Restaurant> restaurants = restaurantRepository.findByNameContainingIgnoreCase(name);
        List<RestaurantDTO> restaurantDTOs = restaurants.stream()
                .map(RestaurantDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurantDTOs);
    }

    @PostMapping
    public ResponseEntity<RestaurantDTO> createRestaurant(@RequestBody Restaurant restaurant) {
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return ResponseEntity.ok(RestaurantDTO.fromEntity(savedRestaurant));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantDTO> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurant) {
        Restaurant existingRestaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        existingRestaurant.setName(restaurant.getName());
        existingRestaurant.setAddress(restaurant.getAddress());
        existingRestaurant.setPhoneNumber(restaurant.getPhoneNumber());
        existingRestaurant.setEmail(restaurant.getEmail());
        existingRestaurant.setDescription(restaurant.getDescription());
        existingRestaurant.setCuisineType(restaurant.getCuisineType());
        existingRestaurant.setOpeningHours(restaurant.getOpeningHours());
        existingRestaurant.setClosingHours(restaurant.getClosingHours());
        existingRestaurant.setImageUrl(restaurant.getImageUrl());

        Restaurant updatedRestaurant = restaurantRepository.save(existingRestaurant);
        return ResponseEntity.ok(RestaurantDTO.fromEntity(updatedRestaurant));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long id) {
        restaurantRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/menu-file")
    public ResponseEntity<?> getMenuFile(@PathVariable Long id) {
        try {
            Restaurant restaurant = restaurantRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

            // Check for both PDF and image menu files
            String fileName = restaurant.getMenuUrl() != null ? 
                restaurant.getMenuUrl() :
                restaurant.getMenuImageUrl();

            if (fileName == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = fileStorageConfig.getMenusPath().resolve(fileName);
            
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            
            // Determine content type based on file extension
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                // Fallback content type based on file extension
                if (fileName.toLowerCase().endsWith(".pdf")) {
                    contentType = MediaType.APPLICATION_PDF_VALUE;
                } else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) {
                    contentType = MediaType.IMAGE_JPEG_VALUE;
                } else if (fileName.toLowerCase().endsWith(".png")) {
                    contentType = MediaType.IMAGE_PNG_VALUE;
                } else {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (Exception e) {
            logger.error("Error retrieving menu file: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving menu: " + e.getMessage()));
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getRestaurantAnalytics() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Restaurant restaurant = restaurantRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

            // Get all orders for this restaurant
            List<Order> orders = orderRepository.findByRestaurantId(restaurant.getId());

            // Calculate analytics
            double totalRevenue = orders.stream()
                    .mapToDouble(Order::getTotalAmount)
                    .sum();

            double averageOrderValue = orders.isEmpty() ? 0 : totalRevenue / orders.size();

            // Group orders by status
            Map<Order.OrderStatus, Long> ordersByStatus = orders.stream()
                    .collect(Collectors.groupingBy(
                            Order::getStatus,
                            Collectors.counting()
                    ));

            // Group orders by day
            Map<String, Double> revenueByDay = orders.stream()
                    .collect(Collectors.groupingBy(
                            order -> order.getOrderTime().toLocalDate().toString(),
                            Collectors.summingDouble(Order::getTotalAmount)
                    ));

            // Get top items
            List<Map.Entry<String, Long>> topItems = orders.stream()
                    .flatMap(order -> order.getItems().stream())
                    .collect(Collectors.groupingBy(
                            OrderItem::getItemName,
                            Collectors.counting()
                    ))
                    .entrySet()
                    .stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(5)
                    .collect(Collectors.toList());

            // Create response
            Map<String, Object> analytics = new HashMap<>();
            analytics.put("totalOrders", orders.size());
            analytics.put("totalRevenue", totalRevenue);
            analytics.put("averageOrderValue", averageOrderValue);
            analytics.put("ordersByStatus", ordersByStatus.entrySet().stream()
                    .map(entry -> Map.of("status", entry.getKey().toString(), "count", entry.getValue()))
                    .collect(Collectors.toList()));
            analytics.put("revenueByDay", revenueByDay.entrySet().stream()
                    .map(entry -> Map.of("date", entry.getKey(), "revenue", entry.getValue()))
                    .collect(Collectors.toList()));
            analytics.put("topItems", topItems.stream()
                    .map(entry -> Map.of("name", entry.getKey(), "quantity", entry.getValue()))
                    .collect(Collectors.toList()));

            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            logger.error("Error fetching analytics: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching analytics: " + e.getMessage()));
        }
    }

    @PostMapping("/categories")
    public ResponseEntity<?> addCategory(@RequestBody Restaurant restaurant) {
        try {
            Restaurant existingRestaurant = restaurantRepository.findById(restaurant.getId())
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
            
            // Update the restaurant's categories
            existingRestaurant.setCategories(restaurant.getCategories());
            Restaurant updatedRestaurant = restaurantRepository.save(existingRestaurant);
            
            return ResponseEntity.ok(updatedRestaurant.getCategories());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error adding category: " + e.getMessage());
        }
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<RestaurantDTO> getRestaurantByUserId(@PathVariable Long userId) {
        try {
            Restaurant restaurant = restaurantRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
            
            RestaurantDTO dto = RestaurantDTO.fromEntity(restaurant);
            
            // Add menu information if available
            List<Menu> menus = menuRepository.findByRestaurantId(restaurant.getId());
            if (menus != null && !menus.isEmpty()) {
                Menu activeMenu = menus.stream()
                        .filter(Menu::isActive)
                        .findFirst()
                        .orElse(menus.get(0));
                dto.setMenuItems(List.of(MenuDTO.fromEntity(activeMenu)));
            }
            
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(value = "/{id}/upload-menu", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadMenu(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: No valid token provided"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Invalid token"));
            }

            Restaurant restaurant = restaurantService.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please select a file to upload"));
            }

            String contentType = file.getContentType();
            if (contentType == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid file type: content type is null"));
            }

            boolean isPdf = contentType.equals("application/pdf");
            boolean isImage = contentType.startsWith("image/");

            if (!isPdf && !isImage) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only PDF and image files are allowed. Received: " + contentType));
            }

            // Generate unique filename with original extension
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid file: filename is null"));
            }

            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = fileStorageConfig.getMenusPath().resolve(filename);
            System.out.println("Saving file to: " + filePath.toAbsolutePath());

            // Create directory if it doesn't exist
            if (!Files.exists(filePath.getParent())) {
                Files.createDirectories(filePath.getParent());
            }

            // Save the file
            Files.copy(file.getInputStream(), filePath);

            // Update restaurant's menu URL based on file type
            if (isPdf) {
                restaurant.setMenuUrl(filename);
                restaurant.setMenuImageUrl(null); // Clear any existing image URL
            } else {
                restaurant.setMenuImageUrl(filename);
                restaurant.setMenuUrl(null); // Clear any existing PDF URL
            }
            restaurantRepository.save(restaurant);

            return ResponseEntity.ok(Map.of(
                "message", "Menu uploaded successfully",
                "filename", filename
            ));
        } catch (ResourceNotFoundException e) {
            System.err.println("Resource not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            System.err.println("IO Error during file upload: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error saving file: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error during menu upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error uploading menu: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/profile-image")
    public ResponseEntity<?> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please select a file to upload"));
            }

            Restaurant restaurant = restaurantRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

            // Create uploads directory if it doesn't exist
            String uploadDir = "uploads/restaurants";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Generate unique filename
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + "/" + fileName;

            // Save the file
            File dest = new File(filePath);
            file.transferTo(dest);

            // Update restaurant's image URL
            restaurant.setImageUrl(fileName);
            restaurantRepository.save(restaurant);

            return ResponseEntity.ok(Map.of(
                "message", "Profile image uploaded successfully",
                "imageUrl", "/api/restaurants/" + id + "/profile-image"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error uploading profile image: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/profile-image")
    public ResponseEntity<?> getProfileImage(@PathVariable Long id) {
        try {
            Restaurant restaurant = restaurantRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

            String fileName = restaurant.getImageUrl();
            if (fileName == null) {
                // Get a random default image
                String[] defaultImages = {
                    "default1.jpg",
                    "default2.jpg",
                    "default3.jpg",
                    "default4.jpg",
                    "default5.jpg"
                };
                
                // Use restaurant ID to ensure consistent image for each restaurant
                int imageIndex = (int) (restaurant.getId() % defaultImages.length);
                String defaultImage = defaultImages[imageIndex];
                
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(new FileSystemResource("src/main/resources/static/images/restaurants/defaults/" + defaultImage));
            }

            String uploadDir = "uploads/restaurants";
            File file = new File(uploadDir + "/" + fileName);
            if (!file.exists()) {
                // If custom image doesn't exist, return a random default
                String[] defaultImages = {
                    "default1.jpg",
                    "default2.jpg",
                    "default3.jpg",
                    "default4.jpg",
                    "default5.jpg"
                };
                
                int imageIndex = (int) (restaurant.getId() % defaultImages.length);
                String defaultImage = defaultImages[imageIndex];
                
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(new FileSystemResource("src/main/resources/static/images/restaurants/defaults/" + defaultImage));
            }

            Resource resource = new FileSystemResource(file);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving profile image: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<?> getRestaurantOrders(@PathVariable Long id) {
        try {
            Restaurant restaurant = restaurantRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
            List<OrderDTO> orders = orderService.getRestaurantOrders(restaurant);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<?> getRestaurantAnalytics(@PathVariable Long id) {
        try {
            Restaurant restaurant = restaurantRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
            
            List<OrderDTO> orders = orderService.getRestaurantOrders(restaurant);
            double totalRevenue = orders.stream()
                    .mapToDouble(OrderDTO::getTotal)
                    .sum();
            
            Map<String, Object> analytics = new HashMap<>();
            analytics.put("totalOrders", orders.size());
            analytics.put("totalRevenue", totalRevenue);
            analytics.put("averageOrderValue", orders.isEmpty() ? 0 : totalRevenue / orders.size());
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUserDetails(token.replace("Bearer ", "")).getUsername();
            User restaurant = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            if (!order.getRestaurant().getId().equals(restaurant.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Not authorized to update this order"));
            }

            String newStatus = request.get("status");
            order.setStatus(Order.OrderStatus.valueOf(newStatus));
            orderRepository.save(order);

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<?> getRestaurantReviews(@PathVariable Long id) {
        try {
            Restaurant restaurant = restaurantRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
            List<Review> reviews = reviewRepository.findByRestaurantId(id);
            return ResponseEntity.ok(reviews.stream()
                    .map(this::convertToReviewDTO)
                    .collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching reviews: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/customers")
    public ResponseEntity<?> getRestaurantCustomers(@PathVariable Long id) {
        try {
            Restaurant restaurant = restaurantRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
            
            // Get all orders for this restaurant
            List<Order> orders = orderRepository.findByRestaurantId(id);
            
            // Get unique customers from orders
            Set<Customer> uniqueCustomers = orders.stream()
                    .map(Order::getCustomer)
                    .collect(Collectors.toSet());
            
            // Convert to DTOs
            List<CustomerDTO> customerDTOs = uniqueCustomers.stream()
                    .map(customer -> {
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
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(customerDTOs);
        } catch (Exception e) {
            logger.error("Error fetching customers: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching customers: " + e.getMessage()));
        }
    }

}
