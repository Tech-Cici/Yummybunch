package com.backend.Yummybunch.controller;

import com.backend.Yummybunch.dto.UserDTO;
import com.backend.Yummybunch.dto.RestaurantDTO;
import com.backend.Yummybunch.model.User;
import com.backend.Yummybunch.model.Restaurant;
import com.backend.Yummybunch.model.Menu;
import com.backend.Yummybunch.model.User.UserRole;
import com.backend.Yummybunch.model.Customer;
import com.backend.Yummybunch.repository.UserRepository;
import com.backend.Yummybunch.repository.RestaurantRepository;
import com.backend.Yummybunch.repository.CustomerRepository;
import com.backend.Yummybunch.repository.MenuRepository;
import com.backend.Yummybunch.security.JwtUtil;
import com.backend.Yummybunch.service.UserService;
import com.backend.Yummybunch.service.CustomerService;
import com.backend.Yummybunch.service.RestaurantService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private CustomerRepository customerRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            String name = credentials.get("name");
            String role = credentials.get("role");

            if (userService.existsByEmail(email)) {
                return ResponseEntity.badRequest().body("Email already exists");
            }

            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setName(name);
            user.setRole(UserRole.valueOf(role.toUpperCase()));

            User savedUser = userService.save(user);

            // Create corresponding entity based on role
            if (role.equalsIgnoreCase("CUSTOMER")) {
                Customer customer = new Customer();
                customer.setUser(savedUser);
                customerService.save(customer);
            } else if (role.equalsIgnoreCase("RESTAURANT")) {
                Restaurant restaurant = new Restaurant();
                restaurant.setUser(savedUser);
                restaurant.setName(name);
                restaurant.setEmail(email);
                restaurant.setPhoneNumber(credentials.get("phoneNumber"));
                restaurant.setAddress(credentials.get("address"));
                restaurant.setDescription("Welcome to " + name);
                restaurant.setOpeningHours("09:00");
                restaurant.setClosingHours("22:00");
                restaurant.setCuisineType(credentials.get("cuisineType"));
                restaurant.setIsVerified(false);
                restaurant.setRating(0.0);
                restaurant.setTotalReviews(0);
                
                // Save the restaurant first to get an ID
                Restaurant savedRestaurant = restaurantService.save(restaurant);
                
                // Create a default menu
                Menu defaultMenu = new Menu();
                defaultMenu.setRestaurant(savedRestaurant);
                defaultMenu.setName("Default Menu");
                defaultMenu.setDescription("Welcome to " + name + "'s menu");
                defaultMenu.setActive(true);
                menuRepository.save(defaultMenu);
            }

            String token = jwtUtil.generateToken(savedUser.getEmail());
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", savedUser);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            String role = credentials.get("role");

            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Verify role if provided
            if (role != null && !user.getRole().toString().equalsIgnoreCase(role)) {
                return ResponseEntity.status(403).body("Invalid role for this user");
            }

            // Use AuthenticationManager to verify credentials
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtUtil.generateToken(email);
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            
            // Create a simplified user response without circular references
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", user.getId());
            userResponse.put("email", user.getEmail());
            userResponse.put("name", user.getName());
            userResponse.put("phoneNumber", user.getPhoneNumber());
            userResponse.put("role", user.getRole());
            
            response.put("user", userResponse);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Login failed: " + e.getMessage());
        }
    }

    @PostMapping("/register/customer")
    public ResponseEntity<?> registerCustomer(@RequestBody Map<String, String> registerRequest) {
        try {
            // Validate required fields
            if (registerRequest == null) {
                return ResponseEntity.badRequest().body("Request body cannot be empty");
            }

            logger.info("Customer registration request: " + registerRequest);

            String email = registerRequest.get("email");
            String password = registerRequest.get("password");
            String name = registerRequest.get("name");
            String phoneNumber = registerRequest.get("phoneNumber");
            String address = registerRequest.get("address");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Name is required");
            }
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Phone number is required");
            }

            // Check if email is already in use
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body("Error: Email is already in use!");
            }

            // Create new user
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setName(name);
            user.setPhoneNumber(phoneNumber);
            user.setRole(UserRole.CUSTOMER);

            // Save user
            User savedUser = userRepository.save(user);

            // Create new customer
            Customer customer = customerService.createCustomerForUser(savedUser);
            if (address != null) {
                customer.setAddress(address);
                customerRepository.save(customer);
            }
            
            // Log successful registration
            logger.info("Customer registered successfully. User ID: {}, Customer ID: {}, Email: {}",
                    savedUser.getId(), customer.getId(), savedUser.getEmail());
            
            String token = jwtUtil.generateToken(email);
            
            // Return success response with user details
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Customer registered successfully!");
            response.put("user", UserDTO.fromEntity(savedUser));
            response.put("token", token);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Customer registration error: ", e);
            return ResponseEntity.status(401).body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register/restaurant")
    public ResponseEntity<?> registerRestaurant(@RequestBody Map<String, String> registerRequest) {
        try {
            // Validate required fields
            if (registerRequest == null) {
                return ResponseEntity.badRequest().body("Request body cannot be empty");
            }

            logger.info("Restaurant registration request: " + registerRequest);

            // Extract user fields
            String email = registerRequest.get("email");
            String password = registerRequest.get("password");
            String name = registerRequest.get("name");
            String phoneNumber = registerRequest.get("phoneNumber");
            String location = registerRequest.get("location");

            // Validate required fields
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Restaurant name is required");
            }
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Phone number is required");
            }
            if (location == null || location.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Location is required");
            }

            // Check if email is already in use
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body("Email is already in use");
            }

            // Create new user
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setName(name);
            user.setPhoneNumber(phoneNumber);
            user.setRole(UserRole.RESTAURANT);

            // Save user
            User savedUser = userRepository.save(user);

            // Create new restaurant
            Restaurant restaurant = new Restaurant();
            restaurant.setName(name);
            restaurant.setEmail(email);
            restaurant.setPhoneNumber(phoneNumber);
            restaurant.setAddress(location);
            restaurant.setUser(savedUser);
            restaurant.setDescription("Welcome to " + name);
            restaurant.setOpeningHours("09:00");
            restaurant.setClosingHours("22:00");
            restaurant.setIsVerified(false);
            restaurant.setRating(0.0);
            restaurant.setTotalReviews(0);

            // Save restaurant
            Restaurant savedRestaurant = restaurantRepository.save(restaurant);
            
            String token = jwtUtil.generateToken(email);
            
            // Log successful registration
            logger.info("Restaurant registered successfully. User ID: {}, Restaurant ID: {}, Email: {}",
                    savedUser.getId(), savedRestaurant.getId(), savedUser.getEmail());

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Restaurant registered successfully!");
            response.put("user", UserDTO.fromEntity(savedUser));
            response.put("restaurant", RestaurantDTO.fromEntity(savedRestaurant));
            response.put("token", token);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Restaurant registration error: ", e);
            return ResponseEntity.status(401).body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            UserDetails userDetails = jwtUtil.extractUserDetails(token);
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(UserDTO.fromEntity(user));
        } catch (Exception e) {
            logger.error("Error verifying token: {}", e.getMessage());
            return ResponseEntity.status(401).body("Invalid token: " + e.getMessage());
        }
    }
}