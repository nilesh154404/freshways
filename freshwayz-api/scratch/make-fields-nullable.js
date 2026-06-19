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
  console.log('Connecting to database with config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database
  });

  const connection = await mysql.createConnection(dbConfig);
  try {
    console.log('Altering health_profile columns to be nullable (NULL)...');
    await connection.query('ALTER TABLE health_profile MODIFY COLUMN `name` varchar(255) NULL');
    await connection.query('ALTER TABLE health_profile MODIFY COLUMN `age` int NULL');
    await connection.query('ALTER TABLE health_profile MODIFY COLUMN `gender` varchar(255) NULL');

    console.log('Table altered successfully.');

    console.log('\n--- Current health_profile column status ---');
    const [finalHpCols] = await connection.query('DESCRIBE health_profile');
    console.table(finalHpCols);

  } catch (err) {
    console.error('Error during database update:', err);
  } finally {
    await connection.end();
  }
}

run();
