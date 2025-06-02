package com.backend.Yummybunch.controller;

import com.backend.Yummybunch.dto.MenuDTO;
import com.backend.Yummybunch.dto.MenuItemDTO;
import com.backend.Yummybunch.exception.ResourceNotFoundException;
import com.backend.Yummybunch.model.Menu;
import com.backend.Yummybunch.model.MenuItem;
import com.backend.Yummybunch.model.Restaurant;
import com.backend.Yummybunch.model.User;
import com.backend.Yummybunch.repository.MenuRepository;
import com.backend.Yummybunch.repository.MenuItemRepository;
import com.backend.Yummybunch.repository.RestaurantRepository;
import com.backend.Yummybunch.security.JwtUtil;
import com.backend.Yummybunch.service.MenuService;
import com.backend.Yummybunch.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class MenuController {

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private MenuService menuService;

    @Autowired
    private RestaurantService restaurantService;

    private final Path menuUploadDir = Paths.get("uploads/menus");

    public MenuController() {
        try {
            Files.createDirectories(menuUploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    @GetMapping("/restaurants/{restaurantId}/menu")
    public ResponseEntity<?> getRestaurantMenu(@PathVariable Long restaurantId) {
        try {
            Restaurant restaurant = restaurantService.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + restaurantId));
            
            Menu menu = menuRepository.findByRestaurant(restaurant)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found for restaurant: " + restaurantId));
            
            return ResponseEntity.ok(menu);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching menu: " + e.getMessage());
        }
    }

    @PostMapping("/restaurants/menu")
    public ResponseEntity<?> addMenuItem(@RequestBody MenuItemDTO menuItemDTO, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Restaurant restaurant = restaurantService.findByUserId(((User) userDetails).getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found for user"));
            
            Menu menu = menuRepository.findByRestaurant(restaurant)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found for restaurant"));
            
            MenuItem menuItem = new MenuItem();
            menuItem.setMenu(menu);
            menuItem.setName(menuItemDTO.getName());
            menuItem.setDescription(menuItemDTO.getDescription());
            menuItem.setPrice(menuItemDTO.getPrice());
            menuItem.setImageUrl(menuItemDTO.getImageUrl());
            menuItem.setAvailable(true);
            
            MenuItem savedItem = menuItemRepository.save(menuItem);
            return ResponseEntity.ok(savedItem);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding menu item: " + e.getMessage());
        }
    }

    @GetMapping("/restaurants/{restaurantId}/menu/items")
    public ResponseEntity<?> getRestaurantMenuItems(@PathVariable Long restaurantId) {
        try {
            Restaurant restaurant = restaurantService.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + restaurantId));
            
            Menu menu = menuRepository.findByRestaurant(restaurant)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found for restaurant: " + restaurantId));
            
            List<MenuItem> menuItems = menuItemRepository.findByMenu(menu);
            return ResponseEntity.ok(menuItems);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching menu items: " + e.getMessage());
        }
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<MenuDTO> getMenusByRestaurant(@PathVariable Long restaurantId) {
        try {
            Restaurant restaurant = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));

            Menu menu = menuRepository.findByRestaurant(restaurant)
                    .orElseThrow(() -> new ResourceNotFoundException("Menu not found for restaurant: " + restaurantId));
            
            MenuDTO menuDTO = MenuDTO.fromEntity(menu);
            return ResponseEntity.ok(menuDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/file/{restaurantId}")
    public ResponseEntity<?> getMenuFile(
            @PathVariable Long restaurantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check authentication
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: No valid token provided");
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Invalid token");
            }

            System.out.println("Looking for restaurant with ID: " + restaurantId);
            // First check if restaurant exists
            Restaurant restaurant = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
            System.out.println("Found restaurant: " + restaurant.getName());

            // Then find the active menu for this restaurant
            Menu menu = menuRepository.findByRestaurant(restaurant)
                    .orElseThrow(() -> new ResourceNotFoundException("Menu not found for restaurant: " + restaurantId));
            
            System.out.println("Menu found: " + (menu != null ? "Yes" : "No"));
            if (menu != null) {
                System.out.println("Menu active: " + menu.isActive());
                System.out.println("Menu PDF URL: " + menu.getPdfUrl());
            }

            if (!menu.isActive()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No active menu found for this restaurant");
            }

            if (menu.getPdfUrl() == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = menuUploadDir.resolve(menu.getPdfUrl());
            System.out.println("Looking for file at: " + filePath.toAbsolutePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType;
                String filename = menu.getPdfUrl();
                if (filename.toLowerCase().endsWith(".pdf")) {
                    contentType = MediaType.APPLICATION_PDF_VALUE;
                } else if (filename.toLowerCase().endsWith(".png")) {
                    contentType = MediaType.IMAGE_PNG_VALUE;
                } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                    contentType = MediaType.IMAGE_JPEG_VALUE;
                } else {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                        .header(HttpHeaders.PRAGMA, "no-cache")
                        .header(HttpHeaders.EXPIRES, "0")
                        .header("X-Frame-Options", "SAMEORIGIN")
                        .body(resource);
            } else {
                System.out.println("File not found or not readable at: " + filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Menu not found: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error accessing menu file: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuDTO> getMenuById(@PathVariable Long id) {
        try {
            Menu menu = menuRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Menu not found"));
            MenuDTO menuDTO = MenuDTO.fromEntity(menu);
            return ResponseEntity.ok(menuDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/restaurant/{restaurantId}")
    public ResponseEntity<MenuDTO> createMenu(@PathVariable Long restaurantId, @RequestBody Menu menu) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        menu.setRestaurant(restaurant);
        Menu savedMenu = menuRepository.save(menu);
        return ResponseEntity.ok(MenuDTO.fromEntity(savedMenu));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuDTO> updateMenu(@PathVariable Long id, @RequestBody Menu menu) {
        Menu existingMenu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu not found"));

        existingMenu.setName(menu.getName());
        existingMenu.setDescription(menu.getDescription());
        existingMenu.setActive(menu.isActive());

        Menu updatedMenu = menuRepository.save(existingMenu);
        return ResponseEntity.ok(MenuDTO.fromEntity(updatedMenu));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenu(@PathVariable Long id) {
        menuRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadMenu(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("file") MultipartFile file) {
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

            System.out.println("Looking for restaurant with email: " + email);
            Restaurant restaurant = restaurantRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found for email: " + email));
            System.out.println("Found restaurant: " + restaurant.getName() + " (ID: " + restaurant.getId() + ")");

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
            Path filePath = menuUploadDir.resolve(filename);
            System.out.println("Saving file to: " + filePath.toAbsolutePath());

            // Create directory if it doesn't exist
            if (!Files.exists(menuUploadDir)) {
                Files.createDirectories(menuUploadDir);
            }

            // Save the file
            Files.copy(file.getInputStream(), filePath);

            // Create or update menu record
            System.out.println("Looking for existing menu for restaurant: " + restaurant.getId());
            Menu existingMenu = menuRepository.findByRestaurant(restaurant)
                    .orElse(null);
            System.out.println("Existing menu found: " + (existingMenu != null ? "Yes" : "No"));
            
            Menu menu;
            if (existingMenu != null) {
                // Delete old file if it exists
                if (existingMenu.getPdfUrl() != null) {
                    try {
                        Path oldFilePath = menuUploadDir.resolve(existingMenu.getPdfUrl());
                        System.out.println("Deleting old file: " + oldFilePath.toAbsolutePath());
                        Files.deleteIfExists(oldFilePath);
                    } catch (IOException e) {
                        System.err.println("Error deleting old file: " + e.getMessage());
                        // Continue with new file
                    }
                }
                menu = existingMenu;
            } else {
                menu = new Menu();
                menu.setRestaurant(restaurant);
            }

            menu.setName("Menu");
            menu.setDescription("Restaurant Menu");
            menu.setPdfUrl(filename);
            menu.setActive(true);

            System.out.println("Saving menu with PDF URL: " + filename);
            menu = menuRepository.save(menu);
            System.out.println("Menu saved with ID: " + menu.getId());

            return ResponseEntity.ok(Map.of(
                "message", "Menu uploaded successfully",
                "filename", filename,
                "menuId", menu.getId()
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

    @PostMapping("/{restaurantId}/menu-pdf")
    public ResponseEntity<?> uploadPdfMenu(
            @PathVariable Long restaurantId,
            @RequestParam("file") MultipartFile file) {
        try {
            String menuUrl = menuService.uploadPdfMenu(restaurantId, file);
            return ResponseEntity.ok(Map.of("menuUrl", menuUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{restaurantId}/menu-pdf")
    public ResponseEntity<?> getPdfMenu(@PathVariable Long restaurantId) {
        try {
            String menuUrl = menuService.getPdfMenuUrl(restaurantId);
            return ResponseEntity.ok(Map.of("menuUrl", menuUrl));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{restaurantId}/menu-image")
    public ResponseEntity<?> uploadImageMenu(
            @PathVariable Long restaurantId,
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = menuService.uploadImageMenu(restaurantId, file);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{restaurantId}/menu-image")
    public ResponseEntity<?> getImageMenu(@PathVariable Long restaurantId) {
        try {
            String imageUrl = menuService.getImageMenuUrl(restaurantId);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/restaurants/{restaurantId}/menu", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadRestaurantMenu(
            @PathVariable Long restaurantId,
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

            System.out.println("Looking for restaurant with ID: " + restaurantId);
            Restaurant restaurant = restaurantService.findById(restaurantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + restaurantId));
            System.out.println("Found restaurant: " + restaurant.getName());

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
            Path filePath = menuUploadDir.resolve(filename);
            System.out.println("Saving file to: " + filePath.toAbsolutePath());

            // Create directory if it doesn't exist
            if (!Files.exists(menuUploadDir)) {
                Files.createDirectories(menuUploadDir);
            }

            // Save the file
            Files.copy(file.getInputStream(), filePath);

            // Create or update menu record
            System.out.println("Looking for existing menu for restaurant: " + restaurant.getId());
            Menu existingMenu = menuRepository.findByRestaurant(restaurant)
                    .orElse(null);
            System.out.println("Existing menu found: " + (existingMenu != null ? "Yes" : "No"));
            
            Menu menu;
            if (existingMenu != null) {
                // Delete old file if it exists
                if (existingMenu.getPdfUrl() != null) {
                    try {
                        Path oldFilePath = menuUploadDir.resolve(existingMenu.getPdfUrl());
                        System.out.println("Deleting old file: " + oldFilePath.toAbsolutePath());
                        Files.deleteIfExists(oldFilePath);
                    } catch (IOException e) {
                        System.err.println("Error deleting old file: " + e.getMessage());
                        // Continue with new file
                    }
                }
                menu = existingMenu;
            } else {
                menu = new Menu();
                menu.setRestaurant(restaurant);
            }

            menu.setName("Menu");
            menu.setDescription("Restaurant Menu");
            menu.setPdfUrl(filename);
            menu.setActive(true);

            System.out.println("Saving menu with PDF URL: " + filename);
            menu = menuRepository.save(menu);
            System.out.println("Menu saved with ID: " + menu.getId());

            return ResponseEntity.ok(Map.of(
                "message", "Menu uploaded successfully",
                "filename", filename,
                "menuId", menu.getId()
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

    @GetMapping("/restaurants/{restaurantId}/menu-image")
    public ResponseEntity<?> getMenuImage(
            @PathVariable Long restaurantId,
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

            Restaurant restaurant = restaurantService.findById(restaurantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + restaurantId));

            Menu menu = menuRepository.findByRestaurant(restaurant)
                    .orElseThrow(() -> new ResourceNotFoundException("Menu not found for restaurant: " + restaurantId));

            if (!menu.isActive()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No active menu found for this restaurant"));
            }

            if (menu.getPdfUrl() == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = menuUploadDir.resolve(menu.getPdfUrl());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType;
                String filename = menu.getPdfUrl();
                if (filename.toLowerCase().endsWith(".pdf")) {
                    contentType = MediaType.APPLICATION_PDF_VALUE;
                } else if (filename.toLowerCase().endsWith(".png")) {
                    contentType = MediaType.IMAGE_PNG_VALUE;
                } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                    contentType = MediaType.IMAGE_JPEG_VALUE;
                } else {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                        .header(HttpHeaders.PRAGMA, "no-cache")
                        .header(HttpHeaders.EXPIRES, "0")
                        .header("X-Frame-Options", "SAMEORIGIN")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error accessing menu file: " + e.getMessage()));
        }
    }
} 