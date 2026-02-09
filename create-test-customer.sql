-- Insert a test customer user with ID 16 if it doesn't exist
INSERT INTO `user` (id, fullName, email, phone, userTypeId, createdAt, updatedAt)
VALUES (16, 'Test Customer', 'customer@test.com', '9876543210', 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  fullName = 'Test Customer',
  email = 'customer@test.com',
  phone = '9876543210';
