-- Step 1: Create a new user account
INSERT INTO `user` (
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




-- Get the user ID
SET @userId = LAST_INSERT_ID();
SELECT @userId as user_id;

-- Step 2: Create a matching customer record with the same ID
INSERT INTO `customer` (
  id,
  fullName, 
  email, 
  phone, 
  userTypeId, 
  createdAt, 
  updatedAt
) VALUES (
  @userId,
  'Aditya Raj', 
  'aditayraj@test.com', 
  '9876543211', 
  1, 
  NOW(), 
  NOW()
);

-- Step 3: Create auth entry for login (password: aditayraj123)
INSERT INTO `auth` (
  username,
  password,
  userId,
  createdAt,
  updatedAt
) VALUES (
  'aditayraj@test.com',
  '$2b$10$...hashedpassword...',
  @userId,
  NOW(),
  NOW()
);
