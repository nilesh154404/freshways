const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('Connected to db for cleanup');

    // Clean up delivery_slots
    const [delSlots] = await connection.execute(`
      DELETE FROM delivery_slots 
      WHERE vendorSubscriptionPlanId IS NOT NULL 
      AND vendorSubscriptionPlanId NOT IN (SELECT id FROM vendor_subscription_plan)
    `);
    console.log('Cleaned up orphaned delivery_slots:', delSlots.affectedRows);

    // Clean up subscription
    const [sub] = await connection.execute(`
      DELETE FROM subscription 
      WHERE planId IS NOT NULL 
      AND planId NOT IN (SELECT id FROM vendor_subscription_plan)
    `);
    console.log('Cleaned up orphaned subscriptions:', sub.affectedRows);

    // Clean up customer_product_list
    const [cpl] = await connection.execute(`
      DELETE FROM customer_product_list 
      WHERE vendorSubscriptionPlanId IS NOT NULL 
      AND vendorSubscriptionPlanId NOT IN (SELECT id FROM vendor_subscription_plan)
    `);
    console.log('Cleaned up orphaned customer_product_list:', cpl.affectedRows);

    // Clean up order (set null since onDelete is SET NULL)
    const [orders] = await connection.execute(`
      UPDATE \`order\` 
      SET vendorSubscriptionPlanId = NULL
      WHERE vendorSubscriptionPlanId IS NOT NULL 
      AND vendorSubscriptionPlanId NOT IN (SELECT id FROM vendor_subscription_plan)
    `);
    console.log('Cleaned up orphaned orders:', orders.affectedRows);

    // Clean up product (set null since onDelete is SET NULL)
    const [products] = await connection.execute(`
      UPDATE product 
      SET vendorSubscriptionPlanId = NULL
      WHERE vendorSubscriptionPlanId IS NOT NULL 
      AND vendorSubscriptionPlanId NOT IN (SELECT id FROM vendor_subscription_plan)
    `);
    console.log('Cleaned up orphaned products:', products.affectedRows);

  } catch (e) {
    console.error('Error during cleanup', e);
  }

  await connection.end();
}

cleanup();
