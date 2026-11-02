/**
 * generate-test-payload.js
 *
 * Helper to generate Dexpert AES-encrypted payloads for testing locally.
 *
 * Usage:
 *   node generate-test-payload.js [transactionId] [amount] [status]
 *
 * Examples:
 *   node generate-test-payload.js TXN_TEST123 500.00 SUCCESS
 *   node generate-test-payload.js TXN_TEST123 500.00 FAILED
 */

const crypto = require('crypto');

const key = Buffer.from('3md6uPicmLlZmlVG', 'utf-8');
const iv = Buffer.from('xVJSbcqImp2utNzi', 'utf-8');

const txnId = process.argv[2] || 'TXN_TEST123';
const amount = process.argv[3] || '500.00';
const status = process.argv[4] || 'SUCCESS';
const mcode = 'MYA344';

// Plain text format as specified by Dexpert Java implementation
const plainText =
  `pgTransId=PG_${Date.now()}` +
  `&transId=DEXP_${Math.floor(Math.random() * 1000000)}` +
  `&amount=${amount}` +
  `&requestedAmount=${amount}` +
  `&mtxnId=${txnId}` +
  `&firstName=Local` +
  `&lastName=Tester` +
  `&payInstrument=UPI` +
  `&email=test@freshways.com` +
  `&contact=9876543210` +
  `&respCode=${status === 'SUCCESS' ? '0' : '1'}` +
  `&mcode=${mcode}` +
  `&txnDate=02-11-2026 12:00:00` +
  `&status=${status}` +
  `&rmsg=${status === 'SUCCESS' ? 'Transaction Successful' : 'Transaction Failed'}`;

// AES-128-CBC encryption (PKCS5/PKCS7 padding)
const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
let encrypted = cipher.update(plainText, 'utf-8', 'base64') + cipher.final('base64');

// Dexpert replaces '+' with '$'
const encryptedDexpertStyle = encrypted.split('+').join('$');
const urlEncodedQuery = encodeURIComponent(encryptedDexpertStyle);

console.log('================================================================');
console.log('       DEXPERT (PAYPLATTER) LOCAL TEST PAYLOAD GENERATOR        ');
console.log('================================================================');
console.log(`Transaction ID : ${txnId}`);
console.log(`Amount         : ${amount}`);
console.log(`Status         : ${status}`);
console.log(`Merchant Code  : ${mcode}`);
console.log('----------------------------------------------------------------');
console.log('1. DECRYPTED PLAIN TEXT FORMAT:');
console.log(plainText);
console.log('----------------------------------------------------------------');
console.log('2. RAW ENCRYPTED (AES-128-CBC with $ replacing +):');
console.log(encryptedDexpertStyle);
console.log('----------------------------------------------------------------');
console.log('3. GET CALLBACK URL (paste in browser or GET request):');
console.log(`http://localhost:5000/api/payments/webhook/dexpert?query=${urlEncodedQuery}&mcode=${mcode}&transDate=02-11-2026 12:00:00`);
console.log('----------------------------------------------------------------');
console.log('4. POST REQUEST BODY (JSON):');
console.log(JSON.stringify({
  query: encryptedDexpertStyle,
  mcode: mcode,
  transDate: '02-11-2026 12:00:00',
}, null, 2));
console.log('================================================================');

