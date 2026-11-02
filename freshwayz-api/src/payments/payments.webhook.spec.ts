/**
 * payments.webhook.spec.ts
 *
 * Comprehensive unit test suite for Dexpert (PayPlatter) encrypted payment
 * webhook integration, verifying:
 *  - Test Case 1: Successful payment response (AES decryption, PENDING -> SUCCESS)
 *  - Test Case 2: Failed payment response (AES decryption, marked FAILED, not SUCCESS)
 *  - Test Case 3: Invalid encrypted query (rejection, DB untouched)
 *  - Test Case 4: Unknown transaction ID (rejected, no record created)
 *  - Test Case 5: Amount mismatch (rejected, not marked SUCCESS)
 *  - Test Case 6: Duplicate callback (idempotent, outcome already_final)
 *  - Test Case 7: Existing payment initiation and verifyPaymentResponse
 *  - Test Case 8: Reference transaction TXN66D55A51EE4A (unencrypted rejected, valid encrypted accepted)
 *  - Additional: Merchant code mismatch, $ character replacement, URL encoding, GET query params
 *
 * All database and repo dependencies are mocked so tests run without live MySQL.
 *
 * Run: npx jest src/payments/payments.webhook.spec.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { Order } from 'src/orders/entities/order.entity';
import { DexpertCryptoUtil } from './dexpert-crypto.util';

const TEST_AES_KEY = '3md6uPicmLlZmlVG';
const TEST_AES_IV = 'xVJSbcqImp2utNzi';
const TEST_MCODE = 'MYA344';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makePayment = (overrides: Partial<Payment> = {}): Payment =>
  Object.assign(new Payment(), {
    id: 1,
    transactionId: 'TXN_ABC123',
    amount: 10.0,
    status: PaymentStatus.PENDING,
    method: PaymentMethod.ONLINE,
    webhookAttempts: 0,
    webhookReceivedAt: null,
    receiptNumber: null,
    pgTransactionId: null,
    order: { id: 42, paymentStatus: 'PENDING' } as Order,
    createdAt: new Date(),
    ...overrides,
  });

function buildDexpertPayload(params: {
  mtxnId?: string;
  transId?: string;
  pgTransId?: string;
  amount?: string;
  requestedAmount?: string;
  status?: string;
  respCode?: string;
  rmsg?: string;
  mcode?: string;
  firstName?: string;
  lastName?: string;
  payInstrument?: string;
  email?: string;
  contact?: string;
  txnDate?: string;
}): string {
  const p = {
    pgTransId: params.pgTransId ?? 'PG987654321',
    transId: params.transId ?? 'DEXP123456',
    amount: params.amount ?? '10.00',
    requestedAmount: params.requestedAmount ?? '10.00',
    mtxnId: params.mtxnId ?? 'TXN_ABC123',
    firstName: params.firstName ?? 'John',
    lastName: params.lastName ?? 'Doe',
    payInstrument: params.payInstrument ?? 'UPI',
    email: params.email ?? 'customer@example.com',
    contact: params.contact ?? '9876543210',
    respCode: params.respCode ?? '0',
    mcode: params.mcode ?? TEST_MCODE,
    txnDate: params.txnDate ?? '31-10-2026 00:24:50',
    status: params.status ?? 'SUCCESS',
    rmsg: params.rmsg ?? 'Transaction Successful',
  };

  return (
    `pgTransId=${p.pgTransId}` +
    `&transId=${p.transId}` +
    `&amount=${p.amount}` +
    `&requestedAmount=${p.requestedAmount}` +
    `&mtxnId=${p.mtxnId}` +
    `&firstName=${p.firstName}` +
    `&lastName=${p.lastName}` +
    `&payInstrument=${p.payInstrument}` +
    `&email=${p.email}` +
    `&contact=${p.contact}` +
    `&respCode=${p.respCode}` +
    `&mcode=${p.mcode}` +
    `&txnDate=${p.txnDate}` +
    `&status=${p.status}` +
    `&rmsg=${p.rmsg}`
  );
}

function encryptPayload(plain: string, key = TEST_AES_KEY, iv = TEST_AES_IV): string {
  return DexpertCryptoUtil.encryptDexpertResponse(plain, key, iv);
}

// ─── Mock QueryRunner factory ─────────────────────────────────────────────────

const makeQueryRunner = (paymentInDb: Payment | null) => ({
  connect: jest.fn().mockResolvedValue(undefined),
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  release: jest.fn().mockResolvedValue(undefined),
  manager: {
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(paymentInDb ? { ...paymentInDb } : null),
    }),
    findOne: jest.fn().mockResolvedValue(paymentInDb?.order ?? null),
    save: jest.fn().mockResolvedValue(undefined),
  },
});

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('PaymentsService - Dexpert Encrypted Webhook & Payment Integration', () => {
  let service: PaymentsService;
  let paymentRepo: any;
  let paymentLogRepo: any;
  let orderRepo: any;
  let mockDataSource: any;

  const buildModule = async (paymentInDb: Payment | null, secretEnv?: string) => {
    const qr = makeQueryRunner(paymentInDb);

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(qr),
    };

    paymentRepo = {
      create: jest.fn().mockImplementation((dto) => Object.assign(new Payment(), dto)),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(paymentInDb),
      }),
      findOne: jest.fn().mockResolvedValue(paymentInDb),
      save: jest.fn().mockResolvedValue(paymentInDb),
    };

    paymentLogRepo = {
      create: jest.fn().mockImplementation((dto) => Object.assign(new PaymentLog(), dto)),
      save: jest.fn().mockResolvedValue({}),
    };

    orderRepo = {
      findOne: jest.fn().mockResolvedValue(paymentInDb?.order ?? null),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(PaymentLog), useValue: paymentLogRepo },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'DEXPERT_AES_KEY') return TEST_AES_KEY;
              if (key === 'DEXPERT_AES_IV') return TEST_AES_IV;
              if (key === 'DEXPERT_MERCHANT_CODE') return TEST_MCODE;
              if (key === 'DEXPERT_WEBHOOK_SECRET') return secretEnv ?? undefined;
              return undefined;
            },
          },
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    return { qr };
  };

  // ── Test Case 1: Successful payment response ──────────────────────────────
  it('Test Case 1: should decrypt valid payload and transition PENDING payment to SUCCESS', async () => {
    const payment = makePayment({ status: PaymentStatus.PENDING, amount: 10.0 });
    const { qr } = await buildModule(payment);

    const plain = buildDexpertPayload({ mtxnId: 'TXN_ABC123', amount: '10.00', status: 'SUCCESS' });
    const encrypted = encryptPayload(plain);

    const result = await service.handleDexpertWebhook({ query: encrypted });

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('updated');
    expect(result.previousStatus).toBe(PaymentStatus.PENDING);
    expect(result.latestStatus).toBe(PaymentStatus.SUCCESS);
    expect(result.receiptNumber).toBeDefined();
    expect(qr.commitTransaction).toHaveBeenCalled();
  });

  // ── Test Case 2: Failed payment response ──────────────────────────────────
  it('Test Case 2: should decrypt failed payload and update payment to FAILED (not SUCCESS)', async () => {
    const payment = makePayment({ status: PaymentStatus.PENDING, amount: 10.0 });
    const { qr } = await buildModule(payment);

    const plain = buildDexpertPayload({
      mtxnId: 'TXN_ABC123',
      amount: '10.00',
      status: 'FAILED',
      respCode: '1',
      rmsg: 'Payment failed at bank',
    });
    const encrypted = encryptPayload(plain);

    const result = await service.handleDexpertWebhook({ query: encrypted });

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('updated');
    expect(result.latestStatus).toBe(PaymentStatus.FAILED);
    expect(qr.commitTransaction).toHaveBeenCalled();
  });

  // ── Test Case 3: Invalid encrypted query ──────────────────────────────────
  it('Test Case 3: should reject malformed or invalid encrypted queries without modifying DB', async () => {
    const payment = makePayment();
    const { qr } = await buildModule(payment);

    const result = await service.handleDexpertWebhook({ query: 'MALFORMED_NON_ENCRYPTED_STRING@@@' });

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('decryption_failed');
    expect(qr.commitTransaction).not.toHaveBeenCalled();
  });

  // ── Test Case 4: Unknown transaction ID ───────────────────────────────────
  it('Test Case 4: should reject valid encrypted payload for an unknown transaction ID', async () => {
    await buildModule(null); // No payment in DB

    const plain = buildDexpertPayload({ mtxnId: 'TXN_UNKNOWN_999' });
    const encrypted = encryptPayload(plain);

    const result = await service.handleDexpertWebhook({ query: encrypted });

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('unknown_transaction');
    expect(result.transactionId).toBe('TXN_UNKNOWN_999');
  });

  // ── Test Case 5: Amount mismatch ──────────────────────────────────────────
  it('Test Case 5: should reject payment confirmation when payload amount differs from DB', async () => {
    const payment = makePayment({ amount: 10.0 });
    const { qr } = await buildModule(payment);

    // Expected 10.00, but payload says 500.00
    const plain = buildDexpertPayload({ mtxnId: 'TXN_ABC123', amount: '500.00' });
    const encrypted = encryptPayload(plain);

    const result = await service.handleDexpertWebhook({ query: encrypted });

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('amount_mismatch');
    expect(qr.commitTransaction).not.toHaveBeenCalled();
  });

  // ── Test Case 6: Duplicate callback (idempotent) ──────────────────────────
  it('Test Case 6: should be idempotent and not duplicate status updates if already SUCCESS', async () => {
    const alreadySuccess = makePayment({
      status: PaymentStatus.SUCCESS,
      receiptNumber: 'RCPT-42-20261028-ABC123',
      pgTransactionId: 'PG987654321',
    });
    const { qr } = await buildModule(alreadySuccess);

    const plain = buildDexpertPayload({ mtxnId: 'TXN_ABC123', amount: '10.00', status: 'SUCCESS' });
    const encrypted = encryptPayload(plain);

    const result = await service.handleDexpertWebhook({ query: encrypted });

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('already_final');
    expect(result.receiptNumber).toBe('RCPT-42-20261028-ABC123');
    // Early return: no commitTransaction on duplicate
    expect(qr.commitTransaction).not.toHaveBeenCalled();
  });

  // ── Test Case 7: Existing payment functionality ───────────────────────────
  it('Test Case 7: initiatePayment should generate valid encrypted router URL and save pending payment', async () => {
    await buildModule(makePayment());

    const result = await service.initiatePayment({
      orderId: 42,
      amount: 50.0,
      customerName: 'Test Customer',
      phoneNumber: '9876543210',
      email: 'test@example.com',
    });

    expect(result.paymentUrl).toBeDefined();
    expect(result.transactionId).toMatch(/^TXN/);
    expect(result.merchantCode).toBe(TEST_MCODE);
    expect(paymentRepo.save).toHaveBeenCalled();
  });

  it('Test Case 7b: verifyPaymentResponse should correctly verify and decrypt browser redirect response', async () => {
    const payment = makePayment({ status: PaymentStatus.PENDING, amount: 10.0 });
    await buildModule(payment);

    const plain = buildDexpertPayload({ mtxnId: 'TXN_ABC123', amount: '10.00', status: 'SUCCESS' });
    const encrypted = encryptPayload(plain);

    const verification = await service.verifyPaymentResponse(encrypted);

    expect(verification.success).toBe(true);
    expect(verification.transactionId).toBe('TXN_ABC123');
    expect(verification.orderStatus).toBe('SUCCESS');
    expect(verification.receiptNumber).toBeDefined();
  });

  // ── Test Case 8: Reference transaction TXN66D55A51EE4A ────────────────────
  it('Test Case 8a: unencrypted transId for TXN66D55A51EE4A must be rejected (loophole closed)', async () => {
    const payment = makePayment({ transactionId: 'TXN66D55A51EE4A', status: PaymentStatus.PENDING });
    const { qr } = await buildModule(payment);

    // Bare transId without encrypted query must not force-update
    const result = await service.handleDexpertWebhook({ transId: 'TXN66D55A51EE4A' });

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('encrypted_query_required');
    expect(qr.commitTransaction).not.toHaveBeenCalled();
  });

  it('Test Case 8b: authenticated encrypted query for TXN66D55A51EE4A updates payment to SUCCESS', async () => {
    const payment = makePayment({ transactionId: 'TXN66D55A51EE4A', status: PaymentStatus.PENDING, amount: 500.0 });
    const { qr } = await buildModule(payment);

    const plain = buildDexpertPayload({
      mtxnId: 'TXN66D55A51EE4A',
      amount: '500.00',
      status: 'SUCCESS',
    });
    const encrypted = encryptPayload(plain);

    const result = await service.handleDexpertWebhook({ query: encrypted });

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('updated');
    expect(result.latestStatus).toBe(PaymentStatus.SUCCESS);
    expect(qr.commitTransaction).toHaveBeenCalled();
  });

  // ── Edge Case: Merchant Code Mismatch ─────────────────────────────────────
  it('should reject webhook if merchant code does not match configured Freshways mcode', async () => {
    const payment = makePayment();
    const { qr } = await buildModule(payment);

    const plain = buildDexpertPayload({ mtxnId: 'TXN_ABC123', mcode: 'WRONG_MERCHANT' });
    const encrypted = encryptPayload(plain);

    const result = await service.handleDexpertWebhook({ query: encrypted });

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('merchant_mismatch');
    expect(qr.commitTransaction).not.toHaveBeenCalled();
  });

  // ── Edge Case: Dexpert $ character in Base64 ──────────────────────────────
  it('should handle Dexpert payload with $ replacing + in Base64 encoding', async () => {
    const payment = makePayment({ status: PaymentStatus.PENDING, amount: 10.0 });
    const { qr } = await buildModule(payment);

    const plain = buildDexpertPayload({ mtxnId: 'TXN_ABC123', amount: '10.00', status: 'SUCCESS' });
    const encrypted = encryptPayload(plain);
    const withDollar = encrypted.replace(/\+/g, '$');

    const result = await service.handleDexpertWebhook({ query: withDollar });

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('updated');
    expect(result.latestStatus).toBe(PaymentStatus.SUCCESS);
    expect(qr.commitTransaction).toHaveBeenCalled();
  });

  // ── Edge Case: GET query parameters callback ──────────────────────────────
  it('should handle GET query parameters (sample format: query=...&mcode=MYA344&transDate=...) ', async () => {
    const payment = makePayment({ status: PaymentStatus.PENDING, amount: 10.0 });
    const { qr } = await buildModule(payment);

    const plain = buildDexpertPayload({ mtxnId: 'TXN_ABC123', amount: '10.00', status: 'SUCCESS' });
    const encrypted = encryptPayload(plain);

    // Call passing queryParams object
    const result = await service.handleDexpertWebhook(
      {},
      undefined,
      { query: encrypted, mcode: TEST_MCODE, transDate: '31-10-2026 00:24:50' },
    );

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('updated');
    expect(result.latestStatus).toBe(PaymentStatus.SUCCESS);
    expect(qr.commitTransaction).toHaveBeenCalled();
  });

  // ── Edge Case: Optional X-Webhook-Secret authentication ────────────────────
  it('should reject webhook if X-Webhook-Secret is configured and header is wrong', async () => {
    await buildModule(makePayment(), 'secret-12345');

    const plain = buildDexpertPayload({ mtxnId: 'TXN_ABC123' });
    const encrypted = encryptPayload(plain);

    const result = await service.handleDexpertWebhook({ query: encrypted }, 'WRONG_SECRET');

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('authentication_failed');
  });

  it('should accept webhook if X-Webhook-Secret is configured and header matches', async () => {
    const payment = makePayment({ status: PaymentStatus.PENDING, amount: 10.0 });
    await buildModule(payment, 'secret-12345');

    const plain = buildDexpertPayload({ mtxnId: 'TXN_ABC123', amount: '10.00', status: 'SUCCESS' });
    const encrypted = encryptPayload(plain);

    const result = await service.handleDexpertWebhook({ query: encrypted }, 'secret-12345');

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('updated');
    expect(result.latestStatus).toBe(PaymentStatus.SUCCESS);
  });
});
