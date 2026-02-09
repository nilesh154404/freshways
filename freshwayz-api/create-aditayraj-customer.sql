-- Create a new customer named aditayraj
INSERT INTO `customer` (
  fullName, 
  email, 
  phone, 
  userTypeId, 
  createdAt, 
  updatedAt
) VALUES (
  'Aditya Raj', 
  'aditayraj@test.com', 
  '9876543211', 
  1, 
  NOW(), 
  NOW()
);

-- Get the customer ID that was just created and display it
SELECT LAST_INSERT_ID() as customer_id;
