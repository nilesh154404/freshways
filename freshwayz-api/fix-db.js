// const mysql = require('mysql2/promise');

// async function run() {
//   const con = await mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '123456789',
//     database: 'freshways'
//   });
  
//   await con.query("UPDATE payment SET status = 'SUCCESS', transactionId = 'TXN1788763950070_762' WHERE transactionId = 'TXN1788763950079_762'");
//   await con.query("UPDATE `order` SET paymentStatus = 'PAID' WHERE id = 113");
  
//   console.log('Updated DB manually');
//   process.exit(0);
// }

// run().catch(console.log);
