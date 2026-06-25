const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456789',
    database: 'freshways',
    port: 3306,
  });

  try {
    const [products] = await connection.query(`
      SELECT id, label, description, vendorId, vendorSubscriptionPlanId 
      FROM product 
      ORDER BY id DESC 
      LIMIT 10;
    `);

    console.log('Last 10 products:');
    for (const p of products) {
      console.log(`\nProduct ID: ${p.id}, Label: "${p.label}", VendorID: ${p.vendorId}, PlanID: ${p.vendorSubscriptionPlanId}`);
      
      const tables = [
        { name: 'listed_order', col: 'productId' },
        { name: 'product_discount', col: 'productId' },
        { name: 'marketing_contents', col: 'product_id' },
        { name: 'price_logs', col: 'productId' },
        { name: 'daily_price', col: 'productId' },
        { name: 'customer_product_list', col: 'productId' },
        { name: 'order_returns', col: 'productId' }
      ];

      for (const table of tables) {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table.name} WHERE ${table.col} = ?`, [p.id]);
        if (rows[0].count > 0) {
          console.log(`  -> Referenced in ${table.name}: ${rows[0].count} times`);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

main();
