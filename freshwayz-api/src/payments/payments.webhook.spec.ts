/**
 * payments.webhook.spec.ts
 *
 * Unit tests for the Dexpert manual-confirmation webhook handler.
 *
 * Flow under test:
 *   Sir POSTs { "transId": "TXN_ABC123" } to /api/payments/webhook/dexpert
 *   → Service looks up the payment, marks it SUCCESS, updates order, writes payment_log.
 *
 * All database / repo dependencies are mocked – no real DB required.
 *
 * Run:
 *   npx jest src/payments/payments.webhook.spec.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { Order } from 'src/orders/entities/order.entity';

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

// Standard webhook body – ONLY transId (the new required format)
const validBody = { transId: 'TXN_ABC123' };

// ─── Mock factories ───────────────────────────────────────────────────────────

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
      setLock: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(paymentInDb ? { ...paymentInDb } : null),
    }),
    findOne: jest.fn().mockResolvedValue(paymentInDb?.order ?? null),
    save: jest.fn().mockResolvedValue(undefined),
  },
});

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('PaymentsService.handleDexpertWebhook – transId-only (always SUCCESS)', () => {
  let service: PaymentsService;
  let paymentRepo: any;
  let paymentLogRepo: any;
  let mockDataSource: any;

  const buildModule = async (paymentInDb: Payment | null, secretEnv?: string) => {
    const qr = makeQueryRunner(paymentInDb);

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(qr),
    };

    paymentRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(paymentInDb),
      }),
      save: jest.fn().mockResolvedValue(paymentInDb),
    };

    paymentLogRepo = {
      create: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(Order), useValue: {} },
        { provide: getRepositoryToken(PaymentLog), useValue: paymentLogRepo },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
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

  // ── Test 1: valid transId, payment is PENDING → marks SUCCESS ─────────────
  it('should mark payment SUCCESS when Sir sends a valid transId (PENDING → SUCCESS)', async () => {
    const { qr } = await buildModule(makePayment());
    const result = await service.handleDexpertWebhook(validBody);

    expect(result.acknowledged).toBe(true);
    expect(['updated', 'already_final']).toContain(result.outcome);
    expect(qr.commitTransaction).toHaveBeenCalled();
    expect(qr.rollbackTransaction).not.toHaveBeenCalled();
  });

  // ── Test 2: idempotent – already SUCCESS (Sir hits it twice) ──────────────
  it('should be idempotent when payment is already SUCCESS (Sir calls twice)', async () => {
    const alreadySuccess = makePayment({
      status: PaymentStatus.SUCCESS,
      receiptNumber: 'RCPT-42-20261028-ABC123',
    });
    await buildModule(alreadySuccess);

    const result = await service.handleDexpertWebhook(validBody);

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('already_final');
  });

  // ── Test 3: FAILED → SUCCESS (retry after failed redirect) ────────────────
  it('should upgrade FAILED → SUCCESS (late confirmation by Sir)', async () => {
    const failedPayment = makePayment({ status: PaymentStatus.FAILED });
    const { qr } = await buildModule(failedPayment);

    const result = await service.handleDexpertWebhook(validBody);

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('updated');
    expect(qr.commitTransaction).toHaveBeenCalled();
  });

  // ── Test 4: unknown transId ───────────────────────────────────────────────
  it('should return unknown_transaction for a transId not in the database', async () => {
    await buildModule(null); // payment not found in DB

    const result = await service.handleDexpertWebhook({ transId: 'TXN_DOES_NOT_EXIST' });

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('unknown_transaction');
  });

  // ── Test 5: missing transId field ─────────────────────────────────────────
  it('should return missing_fields when body has no transId', async () => {
    await buildModule(makePayment());

    const result = await service.handleDexpertWebhook({ someOtherField: 'value' });

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('missing_fields');
  });

  // ── Test 6: empty body ────────────────────────────────────────────────────
  it('should return missing_fields for an empty body {}', async () => {
    await buildModule(makePayment());

    const result = await service.handleDexpertWebhook({});

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('missing_fields');
  });

  // ── Test 7: invalid JSON body (non-object / null) ─────────────────────────
  it('should return invalid_payload for a null body', async () => {
    await buildModule(makePayment());

    const result = await service.handleDexpertWebhook(null as any);

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('invalid_payload');
  });

  // ── Test 8: accepts transaction_id alias ──────────────────────────────────
  it('should accept transaction_id as an alias for transId', async () => {
    const { qr } = await buildModule(makePayment());

    const result = await service.handleDexpertWebhook({ transaction_id: 'TXN_ABC123' });

    expect(result.acknowledged).toBe(true);
    expect(['updated', 'already_final']).toContain(result.outcome);
    expect(qr.commitTransaction).toHaveBeenCalled();
  });

  // ── Test 9: accepts transactionId alias ───────────────────────────────────
  it('should accept transactionId (camelCase) as an alias for transId', async () => {
    const { qr } = await buildModule(makePayment());

    const result = await service.handleDexpertWebhook({ transactionId: 'TXN_ABC123' });

    expect(result.acknowledged).toBe(true);
    expect(['updated', 'already_final']).toContain(result.outcome);
  });

  // ── Test 10: correct webhook secret header ─────────────────────────────────
  it('should pass when correct X-Webhook-Secret header is provided', async () => {
    await buildModule(makePayment(), 'my-secret-123');

    const result = await service.handleDexpertWebhook(validBody, 'my-secret-123');

    expect(result.acknowledged).toBe(true);
    expect(['updated', 'already_final']).toContain(result.outcome);
  });

  // ── Test 11: wrong webhook secret header ──────────────────────────────────
  it('should return authentication_failed when X-Webhook-Secret is wrong', async () => {
    await buildModule(makePayment(), 'my-secret-123');

    const result = await service.handleDexpertWebhook(validBody, 'WRONG-SECRET');

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('authentication_failed');
  });

  // ── Test 12: missing secret header when secret is configured ──────────────
  it('should return authentication_failed when X-Webhook-Secret header is missing', async () => {
    await buildModule(makePayment(), 'my-secret-123');

    // No header passed
    const result = await service.handleDexpertWebhook(validBody);

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('authentication_failed');
  });

  // ── Test 13: payment_log repo is called ───────────────────────────────────
  it('should write a payment_log entry after processing', async () => {
    await buildModule(makePayment());

    await service.handleDexpertWebhook(validBody);

    // paymentLogRepo.create and .save must have been called
    expect(paymentLogRepo.create).toHaveBeenCalled();
    expect(paymentLogRepo.save).toHaveBeenCalled();
  });

  // ── Test 14: payment_log written even for unknown_transaction ─────────────
  it('should still write payment_log for unknown_transaction outcome', async () => {
    await buildModule(null);

    await service.handleDexpertWebhook({ transId: 'UNKNOWN_TXN' });

    expect(paymentLogRepo.create).toHaveBeenCalled();
    expect(paymentLogRepo.save).toHaveBeenCalled();
  });

  // ── Test 15: response includes previousStatus and latestStatus ────────────
  it('should return previousStatus and latestStatus in the response', async () => {
    await buildModule(makePayment({ status: PaymentStatus.PENDING }));

    const result = await service.handleDexpertWebhook(validBody);

    expect(result.acknowledged).toBe(true);
    // previousStatus should be PENDING since the payment starts as PENDING
    expect(result.previousStatus).toBe('PENDING');
  });

  // ── Test 16: second identical call is idempotent ──────────────────────────
  it('should return already_final on second call (idempotency)', async () => {
    const successPayment = makePayment({ status: PaymentStatus.SUCCESS });
    await buildModule(successPayment);

    const result = await service.handleDexpertWebhook(validBody);

    expect(result.acknowledged).toBe(true);
    expect(result.outcome).toBe('already_final');
  });
});
