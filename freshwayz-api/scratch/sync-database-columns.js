const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env if it exists
let dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456789',
  database: 'freshways'
};

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key === 'DB_HOST') dbConfig.host = val;
      if (key === 'DB_PORT') dbConfig.port = parseInt(val, 10);
      if (key === 'DB_USER') dbConfig.user = val;
      if (key === 'DB_PASS') dbConfig.password = val;
      if (key === 'DB_NAME') dbConfig.database = val;
    }
  });
}

async function run() {
  console.log('Connecting to database with config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database
  });

  const connection = await mysql.createConnection(dbConfig);
  try {
    // 1. Inspect health_profile
    console.log('\n--- DESCRIBE health_profile ---');
    const [hpColumns] = await connection.query('DESCRIBE health_profile');
    console.table(hpColumns);

    const allowedHpColumns = [
      'id',
      'userId',
      'name',
      'age',
      'gender',
      'heightCm',
      'weightKg',
      'height',
      'heightUnit',
      'bmi',
      'goal',
      'bloodGroup',
      'analysisPrompt',
      'medicalInformation',
      'medicalHistory',
      'allergies',
      'currentMedications',
      'sleepHours',
      'activityLevel',
      'dietPreference',
      'createdAt',
      'updatedAt'
    ];

    const extraHpColumns = [];
    const missingHpColumns = [];

    // Check which columns are extra or missing in health_profile
    const hpColNames = hpColumns.map(c => c.Field);
    for (const name of hpColNames) {
      if (!allowedHpColumns.includes(name)) {
        extraHpColumns.push(name);
      }
    }
    for (const name of allowedHpColumns) {
      if (!hpColNames.includes(name)) {
        missingHpColumns.push(name);
      }
    }

    console.log('Extra HP Columns to Drop:', extraHpColumns);
    console.log('Missing HP Columns to Add:', missingHpColumns);

    // Drop extra columns from health_profile
    for (const col of extraHpColumns) {
      console.log(`Dropping extra column health_profile.${col}...`);
      await connection.query(`ALTER TABLE health_profile DROP COLUMN \`${col}\``);
    }

    // Add missing columns to health_profile (using defaults matching Entity definition)
    // name (varchar 255), age (int), gender (varchar 255)
    if (missingHpColumns.includes('name')) {
      console.log('Adding missing column health_profile.name...');
      await connection.query('ALTER TABLE health_profile ADD COLUMN `name` varchar(255) NOT NULL AFTER `userId`');
    }
    if (missingHpColumns.includes('age')) {
      console.log('Adding missing column health_profile.age...');
      await connection.query('ALTER TABLE health_profile ADD COLUMN `age` int NOT NULL AFTER `name`');
    }
    if (missingHpColumns.includes('gender')) {
      console.log('Adding missing column health_profile.gender...');
      await connection.query('ALTER TABLE health_profile ADD COLUMN `gender` varchar(255) NOT NULL AFTER `age`');
    }

    // 2. Inspect customer
    console.log('\n--- DESCRIBE customer ---');
    const [customerColumns] = await connection.query('DESCRIBE customer');
    console.table(customerColumns);

    const allowedCustColumns = [
      'id',
      'fullName',
      'email',
      'phone',
      'dob',
      'gender',
      'flatNo',
      'floorNo',
      'address',
      'userTypeId',
      'createdAt',
      'updatedAt'
    ];

    const extraCustColumns = [];
    const custColNames = customerColumns.map(c => c.Field);
    for (const name of custColNames) {
      // Keep primary/foreign key columns and metadata (e.g. userTypeId, id, createdAt, etc.)
      if (!allowedCustColumns.includes(name) && !name.endsWith('Id') && name !== 'id') {
        extraCustColumns.push(name);
      }
    }

    console.log('Extra Customer Columns to Drop:', extraCustColumns);

    // Drop extra columns from customer
    for (const col of extraCustColumns) {
      console.log(`Dropping extra column customer.${col}...`);
      await connection.query(`ALTER TABLE customer DROP COLUMN \`${col}\``);
    }

    console.log('\nFinished synchronization check.');
    console.log('--- Current health_profile ---');
    const [finalHpCols] = await connection.query('DESCRIBE health_profile');
    console.table(finalHpCols);

    console.log('--- Current customer ---');
    const [finalCustCols] = await connection.query('DESCRIBE customer');
    console.table(finalCustCols);

  } catch (err) {
    console.error('Error during database update:', err);
  } finally {
    await connection.end();
  }
}

run();
