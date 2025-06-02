-- Insert default users
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@yummybunch.com', 'admin123', 'ADMIN')
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO users (name, email, password, role) VALUES
('Test Restaurant', 'restaurant@yummybunch.com', 'admin123', 'RESTAURANT')
ON DUPLICATE KEY UPDATE email = email;

-- Insert test restaurant
INSERT INTO restaurants (name, address, phone_number, email, description, cuisine_type, opening_hours, closing_hours, user_id)
SELECT 
    'Test Restaurant',
    '123 Test Street',
    '1234567890',
    'restaurant@yummybunch.com',
    'A test restaurant for development',
    'Italian',
    '09:00:00',
    '22:00:00',
    u.id
FROM users u
WHERE u.email = 'restaurant@yummybunch.com'
ON DUPLICATE KEY UPDATE restaurants.email = restaurants.email;

-- Create customer records for existing users with CUSTOMER role
INSERT INTO customers (user_id, address, delivery_preferences, is_active, preferences, delivery_instructions, loyalty_points)
SELECT 
    id as user_id,
    '' as address,
    NULL as delivery_preferences,
    true as is_active,
    NULL as preferences,
    NULL as delivery_instructions,
    0 as loyalty_points
FROM users 
WHERE role = 'CUSTOMER' 
AND id NOT IN (SELECT user_id FROM customers); 