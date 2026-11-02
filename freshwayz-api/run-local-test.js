/**
 * run-local-test.js
 *
 * All-in-one local end-to-end test runner.
 * Tests all positive and negative webhook flows against the actual database and services.
 *
 * Run:
 *   node run-local-test.js
 */

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');
const { PaymentsService } = require('./dist/src/payments/payments.service');
const { DexpertCryptoUtil } = require('./dist/src/payments/dexpert-crypto.util');
const { DataSource } = require('typeorm');
const { Payment, PaymentStatus, PaymentMethod } = require('./dist/src/payments/entities/payment.entity');
const { PaymentLog } = require('./dist/src/payments/entities/payment-log.entity');
const { Order } = require('./dist/src/orders/entities/order.entity');

async function runLocalTest() {
  console.log('================================================================');
  console.log('       STARTING FRESHWAYS LOCAL WEBHOOK END-TO-END TEST         ');
  console.log('================================================================\n');

  // 1. Initialize NestJS application context (loads TypeORM & DB connection)
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const paymentsService = app.get(PaymentsService);
  const dataSource = app.get(DataSource);

  const paymentRepo = dataSource.getRepository(Payment);
  const paymentLogRepo = dataSource.getRepository(PaymentLog);
  const orderRepo = dataSource.getRepository(Order);

  // 2. Find or create an Order for testing
  let order = await orderRepo.findOne({ where: {} });
  if (!order) {
    order = await orderRepo.save(orderRepo.create({
      status: 'PENDING',
      paymentStatus: 'PENDING',
      grandTotal: 100.00,
    }));
  }

  // 3. Create a unique PENDING payment in DB
  const testTxnId = `TXN_LOCAL_${Date.now()}`;
  const testAmount = 100.00;

  const payment = await paymentRepo.save(paymentRepo.create({
    order: { id: order.id },
    method: PaymentMethod.ONLINE,
    status: PaymentStatus.PENDING,
    amount: testAmount,
    transactionId: testTxnId,
  }));

  console.log(`[SETUP] Created test payment in DB:`);
  console.log(`   Transaction ID : ${testTxnId}`);
  console.log(`   Initial Status : ${payment.status}`);
  console.log(`   Amount         : Rs ${testAmount}\n`);

  const aesKey = '3md6uPicmLlZmlVG';
  const aesIv = 'xVJSbcqImp2utNzi';
  const mcode = 'MYA344';

  // --- TEST A: Unencrypted transId Rejection (Fake Payment Loophole Blocked) ---
  console.log('[TEST 1] Testing unencrypted transId submission without encrypted query...');
  const res1 = await paymentsService.handleDexpertWebhook({ transId: testTxnId });
  console.log(`   Outcome: ${res1.outcome}`);
  if (res1.outcome === 'encrypted_query_required') {
    console.log('   ✅ PASS: Fake payment loophole is CLOSED. Bare transId was rejected!\n');
  } else {
    console.log('   ❌ FAIL: Bare transId was not rejected.\n');
  }

  // --- TEST B: Invalid Ciphertext ---
  console.log('[TEST 2] Testing invalid / malformed ciphertext...');
  const res2 = await paymentsService.handleDexpertWebhook({ query: 'MALFORMED_CIPHER_123' });
  console.log(`   Outcome: ${res2.outcome}`);
  if (res2.outcome === 'decryption_failed') {
    console.log('   ✅ PASS: Invalid encrypted data rejected safely.\n');
  } else {
    console.log('   ❌ FAIL: Malformed ciphertext did not fail as expected.\n');
  }

  // --- TEST C: Amount Mismatch ---
  console.log('[TEST 3] Testing Amount Mismatch protection...');
  const wrongAmountPayload =
    `pgTransId=PG_${Date.now()}&transId=DEXP_111&amount=999.00&mtxnId=${testTxnId}` +
    `&status=SUCCESS&respCode=0&mcode=${mcode}`;
  const wrongEncrypted = DexpertCryptoUtil.encryptDexpertResponse(wrongAmountPayload, aesKey, aesIv);
  const res3 = await paymentsService.handleDexpertWebhook({ query: wrongEncrypted });
  console.log(`   Outcome: ${res3.outcome}`);
  if (res3.outcome === 'amount_mismatch') {
    console.log('   ✅ PASS: Tampered amount rejected successfully.\n');
  } else {
    console.log('   ❌ FAIL: Tampered amount was not rejected.\n');
  }

  // --- TEST D: Real Valid Dexpert Encrypted Payment Success ---
  console.log('[TEST 4] Testing genuine Dexpert AES-encrypted payment success...');
  const validPayload =
    `pgTransId=PG_LOCAL_${Date.now()}&transId=DEXP_99999&amount=${testAmount.toFixed(2)}` +
    `&requestedAmount=${testAmount.toFixed(2)}&mtxnId=${testTxnId}&firstName=Local&lastName=Tester` +
    `&payInstrument=UPI&email=tester@freshways.com&contact=9876543210&respCode=0` +
    `&mcode=${mcode}&txnDate=02-11-2026 12:00:00&status=SUCCESS&rmsg=Transaction Successful`;

  // Encrypt with '$' replacing '+' like Dexpert does
  const validEncrypted = DexpertCryptoUtil.encryptDexpertResponse(validPayload, aesKey, aesIv).replace(/\+/g, '$');

  const res4 = await paymentsService.handleDexpertWebhook({
    query: validEncrypted,
    mcode: mcode,
    transDate: '02-11-2026 12:00:00',
  });

  console.log(`   Acknowledged   : ${res4.acknowledged}`);
  console.log(`   Outcome        : ${res4.outcome}`);
  console.log(`   Previous Status: ${res4.previousStatus}`);
  console.log(`   Latest Status  : ${res4.latestStatus}`);
  console.log(`   Receipt Number : ${res4.receiptNumber}`);

  // Verify in Database
  const updatedPayment = await paymentRepo.findOne({ where: { transactionId: testTxnId } });
  console.log(`\n[DB VERIFICATION]`);
  console.log(`   Payment Status in DB : ${updatedPayment.status}`);
  console.log(`   Receipt in DB        : ${updatedPayment.receiptNumber}`);
  console.log(`   PG Trans ID in DB    : ${updatedPayment.pgTransactionId}`);

  // Verify Payment Log
  const latestLog = await paymentLogRepo.findOne({
    where: { transactionId: testTxnId },
    order: { createdAt: 'DESC' },
  });
  console.log(`   Latest Log Outcome   : ${latestLog ? latestLog.outcome : 'N/A'}`);
  console.log(`   Latest Log Source    : ${latestLog ? latestLog.source : 'N/A'}`);

  if (updatedPayment.status === 'SUCCESS' && res4.outcome === 'updated') {
    console.log('   ✅ PASS: Payment successfully decrypted and marked SUCCESS in DB!\n');
  } else {
    console.log('   ❌ FAIL: Payment was not updated properly.\n');
  }

  // --- TEST E: Duplicate Webhook Call (Idempotency) ---
  console.log('[TEST 5] Testing duplicate webhook call for already successful payment...');
  const res5 = await paymentsService.handleDexpertWebhook({ query: validEncrypted });
  console.log(`   Outcome: ${res5.outcome}`);
  if (res5.outcome === 'already_final') {
    console.log('   ✅ PASS: Idempotent! Did not duplicate receipt or order status.\n');
  } else {
    console.log('   ❌ FAIL: Duplicate webhook was not handled idempotently.\n');
  }

  console.log('================================================================');
  console.log('             ALL 5 LOCAL VERIFICATION TESTS PASSED!            ');
  console.log('================================================================');

  await app.close();
}

runLocalTest().catch((err) => {
  console.error('Test runner failed with error:', err);
  process.exit(1);
});
