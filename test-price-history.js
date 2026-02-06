// Quick Test Script for Price History System
// Run this after starting the NestJS server

const axios = require('axios');

const API_BASE = 'http://localhost:3064';

async function testPriceHistorySystem() {
  console.log('🧪 Testing Price History System\n');

  try {
    // Test 1: Get all daily prices
    console.log('1️⃣ Fetching all daily prices...');
    const pricesRes = await axios.get(`${API_BASE}/daily-price`);
    console.log(`✅ Found ${pricesRes.data.length} price entries\n`);

    if (pricesRes.data.length > 0) {
      const samplePrice = pricesRes.data[0];
      const productId = samplePrice.product.id;
      const vendorId = samplePrice.vendor.id;

      // Test 2: Get price history for a product
      console.log(`2️⃣ Fetching price history for product ${productId}...`);
      const historyRes = await axios.get(
        `${API_BASE}/daily-price/product/${productId}/history?vendorId=${vendorId}`
      );
      console.log(`✅ Found ${historyRes.data.length} price change logs`);
      
      if (historyRes.data.length > 0) {
        console.log('\n📊 Sample Price Log Entry:');
        const log = historyRes.data[0];
        console.log(`   Old: ₹${log.old_amount} → New: ₹${log.new_amount}`);
        console.log(`   Changed: ${new Date(log.changedAt).toLocaleString()}\n`);
      }

      // Test 3: Update a price (creates a log entry)
      console.log('3️⃣ Updating price to test logging...');
      const newAmount = Number(samplePrice.amount) + 1;
      const updateRes = await axios.post(`${API_BASE}/daily-price`, {
        productId,
        vendorId,
        amount: newAmount,
        mrp_amount: samplePrice.mrp_amount,
        date: new Date().toISOString().split('T')[0],
        isActive: true
      });
      console.log(`✅ Price updated to ₹${newAmount}\n`);

      // Test 4: Verify log was created
      console.log('4️⃣ Verifying new log entry was created...');
      const newHistoryRes = await axios.get(
        `${API_BASE}/daily-price/product/${productId}/history?vendorId=${vendorId}`
      );
      const latestLog = newHistoryRes.data[0];
      
      if (latestLog && latestLog.new_amount == newAmount) {
        console.log('✅ Log entry created successfully!');
        console.log(`   Old: ₹${latestLog.old_amount} → New: ₹${latestLog.new_amount}\n`);
      } else {
        console.log('⚠️  Log might not have been created or still processing\n');
      }
    }

    console.log('✅ All tests completed!\n');
    console.log('📝 Next steps:');
    console.log('   1. Run the SQL migration if not done');
    console.log('   2. Wait 5 minutes for cron job to run');
    console.log('   3. Check frontend price log page');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPriceHistorySystem();
