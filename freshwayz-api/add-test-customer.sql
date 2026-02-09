-- Add a test customer for user ID 16
INSERT INTO `customer` (id, fullName, email, phone, userTypeId, createdAt, updatedAt)
VALUES (16, 'Test Customer', 'customer@test.com', '9876543210', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  fullName = 'Test Customer',
  email = 'customer@test.com',
  phone = '9876543210';

-- Link the auth entry to this customer (if needed)
-- INSERT INTO `auth` (username, password, customerId, createdAt, updatedAt)
-- VALUES ('customer@test.com', '$2b$10$...hashedpassword...', 16, NOW(), NOW());
