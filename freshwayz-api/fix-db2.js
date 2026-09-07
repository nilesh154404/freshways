// const mysql = require('mysql2/promise');

// async function run() {
//   const con = await mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '123456789',
//     database: 'freshways'
//   });
  
//   await con.query("UPDATE payment SET status = 'SUCCESS' WHERE orderId = 114 AND id = 25");
//   await con.query("UPDATE `order` SET paymentStatus = 'PAID' WHERE id = 114");
  
//   console.log('Fixed order 114 manually');
//   process.exit(0);
// }

// run().catch(console.log);
