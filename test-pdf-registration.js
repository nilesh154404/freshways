const fs = require('fs');
const FormData = require('form-data');
const http = require('http');

// Create a simple test PDF content (as base64)
// This is a minimal valid PDF
const pdfBase64 = 'JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iagoyIDAgb2JqPDwvVHlwZS9QYWdlcy9LaWRzWzMgMCBSXS9Db3VudCAxPj5lbmRvYmogCjMgMCBvYmo8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjE8PC9UeXBlL0ZvbnQvU3VidHlwZS9IZWxtdGljYS9CYXNlRm9udC9IZWxtdGljYT4+Pj4+PgovQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDI4OD4+c3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzUwIFRkIChQQVRJRU5UX0hFQUxUSF9SRVBPUlQpIFRqIApFVApFbmRzdHJlYW0gCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTEzIDAwMDAwIG4gCjAwMDAwMDA0MTAgMDAwMDAgbiAKdHJhaWxlcjw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjc0NwolJUVPRg==';

const pdfBuffer = Buffer.from(pdfBase64, 'base64');

// Test registration data
const testData = {
  // Customer fields
  fullName: 'Test Patient',
  email: 'test@example.com',
  phone: '9876543210',
  dob: '1990-01-15',
  gender: 'Male',
  goal: 'weight_loss',
  community: 'Test Community',
  landmark: 'Test Landmark',
  locality: 'Test Locality',
  
  // Health fields
  heightCm: '175',
  weightKg: '85',
  bloodGroup: 'O+',
  medicalHistory: 'Hypertension, family history of diabetes',
  allergies: 'Penicillin',
  currentMedications: 'Lisinopril 10mg',
  sleepHours: '6',
  activityLevel: 'Sedentary',
  dietPreference: 'Vegetarian',
  bloodReports: 'Available',
  vitaminD: '25',
  vitaminB12: '300',
  cholesterol: '220',
  fastingSugar: '115',
  hba1c: '6.2',
  
  // Auth
  username: `testuser_${Date.now()}`,
  password: 'TestPassword123@'
};

// Create form data
const form = new FormData();

// Add customer fields
Object.entries(testData).forEach(([key, value]) => {
  form.append(key, value);
});

// Add PDF file
form.append('reportFiles', pdfBuffer, 'health_report.pdf');

// Make the request
const options = {
  hostname: 'localhost',
  port: 3050,
  path: '/auth/register/customer',
  method: 'POST',
  headers: form.getHeaders()
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('\n=== RESPONSE ===\n');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      // Check if AI extracted data from PDF
      if (parsed.aiGeneratedInsights) {
        console.log('\n✅ AI SUCCESSFULLY EXTRACTED DATA FROM UPLOADED PDF!\n');
        console.log('AI-Generated Health Insights:');
        console.log(JSON.stringify(parsed.aiGeneratedInsights, null, 2));
      } else {
        console.log('\n⚠️  No AI insights generated');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request failed:', error.message);
});

form.pipe(req);
console.log('Testing registration with PDF file upload...\n');
