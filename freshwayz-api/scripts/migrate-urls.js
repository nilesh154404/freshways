// const mysql = require('mysql2/promise');

// async function migrate() {
//   try {
//     const conn = await mysql.createConnection({
//       host: 'localhost',
//       user: 'root',
//       password: '123456789',
//       database: 'freshways',
//     });

//     const [r1] = await conn.execute(
//       `UPDATE file_upload 
//        SET fileUrl = REPLACE(REPLACE(fileUrl, 'https://freshwayz.dexpertsystems.com/uploads', 'https://admin.freshwayz.dexpertsystems.com/uploads'), 'http://freshwayz.dexpertsystems.com/uploads', 'https://admin.freshwayz.dexpertsystems.com/uploads')
//        WHERE fileUrl LIKE '%freshwayz.dexpertsystems.com/uploads%'`
//     );
//     console.log('file_upload updated rows:', r1.affectedRows);

//     const [r2] = await conn.execute(
//       `UPDATE categories 
//        SET img_link = REPLACE(REPLACE(img_link, 'https://freshwayz.dexpertsystems.com/uploads', 'https://admin.freshwayz.dexpertsystems.com/uploads'), 'http://freshwayz.dexpertsystems.com/uploads', 'https://admin.freshwayz.dexpertsystems.com/uploads')
//        WHERE img_link LIKE '%freshwayz.dexpertsystems.com/uploads%'`
//     );
//     console.log('categories updated rows:', r2.affectedRows);

//     const [r3] = await conn.execute(
//       `UPDATE product 
//        SET productUrl = REPLACE(REPLACE(productUrl, 'https://freshwayz.dexpertsystems.com/uploads', 'https://admin.freshwayz.dexpertsystems.com/uploads'), 'http://freshwayz.dexpertsystems.com/uploads', 'https://admin.freshwayz.dexpertsystems.com/uploads')
//        WHERE productUrl LIKE '%freshwayz.dexpertsystems.com/uploads%'`
//     );
//     console.log('product updated rows:', r3.affectedRows);

//     await conn.end();
//   } catch (err) {
//     console.error('Error during migration:', err);
//   }
// }

// migrate();
