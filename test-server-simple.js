const http = require('http');

// Test if server is responding
const options = {
  hostname: 'localhost',
  port: 3050,
  path: '/auth/register/customer',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (data) => {
    console.log(data.toString());
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
console.log('Testing if server is responding...');
