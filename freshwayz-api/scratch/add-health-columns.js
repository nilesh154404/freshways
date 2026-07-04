const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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
  console.log('Connecting to database to add columns...');
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [columns] = await connection.query('DESCRIBE health_profile');
    const hpColNames = columns.map(c => c.Field);

    if (!hpColNames.includes('height')) {
      console.log('Adding column height...');
      await connection.query('ALTER TABLE health_profile ADD COLUMN `height` float DEFAULT NULL AFTER `weightKg`');
    }
    if (!hpColNames.includes('heightUnit')) {
      console.log('Adding column heightUnit...');
      await connection.query('ALTER TABLE health_profile ADD COLUMN `heightUnit` varchar(10) NOT NULL DEFAULT "cm" AFTER `height`');
    }
    if (!hpColNames.includes('bmi')) {
      console.log('Adding column bmi...');
      await connection.query('ALTER TABLE health_profile ADD COLUMN `bmi` float DEFAULT NULL AFTER `heightUnit`');
    }
    if (!hpColNames.includes('goal')) {
      console.log('Adding column goal...');
      await connection.query('ALTER TABLE health_profile ADD COLUMN `goal` varchar(255) DEFAULT NULL AFTER `bmi`');
    }
    if (!hpColNames.includes('analysisPrompt')) {
      console.log('Adding column analysisPrompt...');
      await connection.query('ALTER TABLE health_profile ADD COLUMN `analysisPrompt` text DEFAULT NULL AFTER `bloodGroup`');
    }

    console.log('✅ Columns added successfully.');
  } catch (err) {
    console.error('Error modifying table:', err);
  } finally {
    await connection.end();
  }
}

run();
