const bcrypt = require('bcrypt');

// Generate hash for password "aditayraj123"
const password = "aditayraj123";

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Hashed password:', hash);
    console.log('\nUse this in your SQL:');
    console.log(`INSERT INTO \`customer\` (id, fullName, email, phone, userTypeId, createdAt, updatedAt) VALUES (16, 'Aditya Raj', 'aditayraj@test.com', '9876543211', 1, NOW(), NOW());`);
    console.log(`\nThen for auth:`);
    console.log(`INSERT INTO \`auth\` (username, password, userId, createdAt, updatedAt) VALUES ('aditayraj@test.com', '${hash}', 16, NOW(), NOW());`);
  }
});
