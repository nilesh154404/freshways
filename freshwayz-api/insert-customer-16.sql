-- Create a test customer record for user ID 16
INSERT INTO `customer` (
  id, 
  fullName, 
  email, 
  phone, 
  userTypeId, 
  createdAt, 
  updatedAt
) VALUES (
  16, 
  'Admin Customer', 
  'admin.customer@test.com', 
  '9876543210', 
  1, 
  NOW(), 
  NOW()
) ON DUPLICATE KEY UPDATE 
  fullName = 'Admin Customer',
  email = 'admin.customer@test.com',
  phone = '9876543210';
