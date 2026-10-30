import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { DexpertCryptoUtil } from './dexpert-crypto.util';
import { Order } from 'src/orders/entities/order.entity';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';
import { PaymentLog } from './entities/payment-log.entity';
import * as crypto from 'crypto';

export const paymentDebugLogs: any[] = [];

// ─── Return types ────────────────────────────────────────────────────────────

export type ProcessPaymentOutcome =
  | 'updated'       // status changed successfully
  | 'already_final' // was already SUCCESS – no update needed
  | 'not_found';    // no matching payment row exists

export interface ProcessPaymentResult {
  outcome: ProcessPaymentOutcome;
  transactionId: string;
  receiptNumber?: string;
  previousStatus?: string;
  newStatus?: string;
}

export interface WebhookHandleResult {
  acknowledged: boolean;
  outcome: string;
  transactionId?: string;
  previousStatus?: string;
  latestStatus?: string;
  receiptNumber?: string;
  orderId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  // Dexpert Gateway Configuration (from env / fallback to test credentials)
  private readonly routerDomain: string;
  private readonly username: string;
  private readonly password: string;
  private readonly merchantCode: string;
  private readonly privateKey: string;
  private readonly privateValue: string;
  private readonly urlSuccess: string;
  private readonly urlFail: string;

  private generateReceiptNumber(orderId: number, transactionId: string): string {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const txnSuffix = transactionId.slice(-6).toUpperCase();
    return `RCPT-${orderId}-${timestamp}-${txnSuffix}`;
  }

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(PaymentLog)
    private readonly paymentLogRepository: Repository<PaymentLog>,
    private readonly configService: ConfigService,
    // DataSource gives us QueryRunner for true DB transactions + pessimistic locking
    private readonly dataSource: DataSource,
  ) {
    this.routerDomain =
      this.configService.get<string>('DEXPERT_ROUTER_DOMAIN') ||
      'https://dexpertsystems.com/Router/initiateTransaction';
    this.username =
      this.configService.get<string>('DEXPERT_USERNAME') || 'MSANDY344';
    this.password =
      this.configService.get<string>('DEXPERT_PASSWORD') || '[C@2e2789b';
    this.merchantCode =
      this.configService.get<string>('DEXPERT_MERCHANT_CODE') || 'MYA344';
    this.privateKey =
      this.configService.get<string>('DEXPERT_PRIVATE_KEY') ||
      'HQ9ej2ncdwnbIB5a';
    this.privateValue =
      this.configService.get<string>('DEXPERT_PRIVATE_VALUE') ||
      'wmJRtH4WKvv733tF';
    this.urlSuccess =
      this.configService.get<string>('DEXPERT_URL_SUCCESS') ||
      'https://admin.freshwayz.dexpertsystems.com/api/payments/response';
    this.urlFail =
      this.configService.get<string>('DEXPERT_URL_FAIL') ||
      'https://admin.freshwayz.dexpertsystems.com/api/payments/response';
  }

  // ===========================================================================
  // EXISTING: initiatePayment (unchanged)
  // ===========================================================================

  async initiatePayment(createPaymentDto: CreatePaymentDto) {
    if (!createPaymentDto.orderId) {
      throw new InternalServerErrorException(
        'orderId is required to initiate a payment.',
      );
    }

    // Always generate a completely unique transaction ID to prevent Dexpert
    // "resubmitted" errors in case the frontend retries with the same transactionId.
    const baseTxnId = createPaymentDto.transactionId
      ? createPaymentDto.transactionId + '_'
      : 'TXN';
    const randomHex = crypto.randomBytes(6).toString('hex').toUpperCase();
    const txnId = `${baseTxnId}${randomHex}`;
    const txnAmt = createPaymentDto.amount;

    // Save pending payment to DB
    try {
      const newPayment = this.paymentRepository.create({
        order: { id: createPaymentDto.orderId },
        method: PaymentMethod.ONLINE,
        status: PaymentStatus.PENDING,
        amount: txnAmt,
        transactionId: txnId,
      });
      await this.paymentRepository.save(newPayment);
      this.logger.log(
        `Created pending payment for order ${createPaymentDto.orderId} with txnId ${txnId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to create pending payment record: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Could not initiate payment in the database. Ensure orderId ${createPaymentDto.orderId} exists. Error: ${error.message}`,
      );
    }

    const customerName = createPaymentDto.customerName || '';
    const pfname = customerName.split(' ')[0] || '';
    const plname = customerName.split(' ').slice(1).join(' ') || '';
    const pmno = createPaymentDto.phoneNumber || '';
    const pemail = createPaymentDto.email || '';
    const settlement_split = `online_${txnAmt}~`;

    const routerUrl = `?mcode=${this.merchantCode}&uname=${this.username}&psw=${this.password}&amount=${txnAmt}&settlement_split=${settlement_split}&mtxnId=${txnId}&pfname=${pfname}&plname=${plname}&pmno=${pmno}&pemail=${pemail}&padd=&surl=${this.urlSuccess}&furl=${this.urlFail}&udf6=`;
    this.logger.log(`Generated Dexpert routerUrl for txnId ${txnId}`);

    const encryptedUrl = DexpertCryptoUtil.encrypt(
      routerUrl,
      this.privateValue,
      this.privateKey,
    );
    const finalEncryptedUrl = encryptedUrl.replace(/\+/g, '%2B');

    const query = `?query=${finalEncryptedUrl}&mcode=${this.merchantCode}`;
    const fullPaymentUrl = `${this.routerDomain}${query}`;

    return {
      paymentUrl: fullPaymentUrl,
      transactionId: txnId,
      encryptedQuery: finalEncryptedUrl,
      merchantCode: this.merchantCode,
    };
  }

  // ===========================================================================
  // NEW (SHARED): processConfirmedPayment
  //
  // Single source of truth for updating a payment and its order.
  // Called by both the browser-redirect handler and the webhook handler.
  //
  // Guarantees:
  //  - Atomic    : uses a QueryRunner DB transaction.
  //  - Safe      : pessimistic write lock prevents concurrent race conditions.
  //  - Idempotent: SUCCESS is never downgraded; duplicate calls are no-ops.
  //  - Late-success: FAILED -> SUCCESS upgrade IS allowed (webhook can arrive
  //    after a "failed" redirect that actually succeeded at the gateway).
  // ===========================================================================

  async processConfirmedPayment(
    transactionId: string,
    isSuccess: boolean,
    source: 'redirect' | 'webhook' | 'reconciliation',
    pgTransactionId?: string,
  ): Promise<ProcessPaymentResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');

    try {
      // 1. Load and lock the payment row (FOR UPDATE)
      const payment = await queryRunner.manager
        .createQueryBuilder(Payment, 'payment')
        .leftJoinAndSelect('payment.order', 'order')
        .where('LOWER(payment.transactionId) = LOWER(:tid)', { tid: transactionId })
        .setLock('pessimistic_write')
        .getOne();

      if (!payment) {
        await queryRunner.rollbackTransaction();
        this.logger.warn(
          `[${source}] processConfirmedPayment: no payment found for txnId=${transactionId}`,
        );
        return { outcome: 'not_found', transactionId };
      }

      // 2. Idempotency guard – never downgrade a verified SUCCESS
      if (payment.status === PaymentStatus.SUCCESS) {
        if (pgTransactionId && !payment.pgTransactionId) {
          payment.pgTransactionId = pgTransactionId;
          await queryRunner.manager.save(Payment, payment);
          await queryRunner.commitTransaction();
          this.logger.log(
            `[${source}] Payment ${transactionId} already SUCCESS – attached pgTransactionId=${pgTransactionId}.`,
          );
        } else {
          await queryRunner.rollbackTransaction();
          this.logger.log(
            `[${source}] Payment ${transactionId} already SUCCESS – skipping update (idempotent).`,
          );
        }
        return {
          outcome: 'already_final',
          transactionId,
          receiptNumber: payment.receiptNumber,
          previousStatus: PaymentStatus.SUCCESS,
          newStatus: PaymentStatus.SUCCESS,
        };
      }

      // 3. Update payment status (allows PENDING->SUCCESS, FAILED->SUCCESS)
      const previousStatus = payment.status;
      payment.status = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

      if (pgTransactionId && !payment.pgTransactionId) {
        payment.pgTransactionId = pgTransactionId;
      }

      let receiptNumber: string | undefined;
      if (isSuccess) {
        if (!payment.receiptNumber && payment.order?.id) {
          payment.receiptNumber = this.generateReceiptNumber(
            payment.order.id,
            transactionId,
          );
        }
        receiptNumber = payment.receiptNumber;
      }

      await queryRunner.manager.save(Payment, payment);
      this.logger.log(
        `[${source}] Payment ${transactionId}: ${previousStatus} -> ${payment.status}` +
          (receiptNumber ? ` | receipt=${receiptNumber}` : ''),
      );

      // 4. Update order payment status (never downgrade PAID)
      if (payment.order?.id) {
        const order = await queryRunner.manager.findOne(Order, {
          where: { id: payment.order.id },
        });

        if (order) {
          if (order.paymentStatus !== 'PAID') {
            order.paymentStatus = isSuccess ? 'PAID' : 'FAILED';
            await queryRunner.manager.save(Order, order);
            this.logger.log(
              `[${source}] Order ${order.id} paymentStatus -> ${order.paymentStatus}`,
            );
          } else {
            this.logger.log(
              `[${source}] Order ${order.id} already PAID – no order update needed.`,
            );
          }
        } else {
          this.logger.warn(
            `[${source}] Payment ${transactionId} saved, but order ${payment.order.id} not found.`,
          );
        }
      } else {
        this.logger.warn(
          `[${source}] Payment ${transactionId} has no associated order to update.`,
        );
      }

      await queryRunner.commitTransaction();
      return {
        outcome: 'updated',
        transactionId,
        receiptNumber,
        previousStatus: String(previousStatus),
        newStatus: String(payment.status),
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `[${source}] DB transaction failed for ${transactionId}: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===========================================================================
  // EXISTING: verifyPaymentResponse  (browser redirect – return shape UNCHANGED)
  //
  // Refactored to delegate DB update to processConfirmedPayment so both the
  // redirect and webhook paths share the same idempotency/locking guarantees.
  // ===========================================================================

  async verifyPaymentResponse(encryptedQuery: string) {
    this.logger.log(`Received encryptedQuery from Dexpert for verification.`);
    try {
      // Browsers often convert '+' to ' ' in query parameters.
      // We must revert spaces back to '+' for base64 decryption to work!
      const sanitizedQuery = encryptedQuery.replace(/ /g, '+');
      const decText = DexpertCryptoUtil.decrypt(
        sanitizedQuery,
        this.privateValue,
        this.privateKey,
      );

      const decryptValues = decText.split('&');

      const responseData: Record<string, string> = {};
      decryptValues.forEach((val) => {
        const [key, value] = val.split('=');
        if (key) {
          responseData[key] = value || '';
        }
      });

      paymentDebugLogs.push({
        time: new Date().toISOString(),
        encryptedQuery: sanitizedQuery,
        responseData,
      });
      if (paymentDebugLogs.length > 20) paymentDebugLogs.shift();

      this.logger.log(
        `Decrypted Dexpert Response: ${JSON.stringify(responseData)}`,
      );

      const orderStatusStr =
        responseData['status'] || responseData['order_status'] || '';
      const transactionId =
        responseData['mtxnId'] ||
        responseData['txnid'] ||
        responseData['txnId'] ||
        responseData['pg_transt_id'];

      // Dexpert's own gateway reference (if present in the response)
      const pgTransactionId = responseData['pg_transt_id'] || undefined;

      const isSuccess = orderStatusStr.toLowerCase().trim() === 'success';
      let receiptNumber: string | undefined;

      this.logger.log(
        `Verifying payment - TxnId: ${transactionId}, Status: ${orderStatusStr}, IsSuccess: ${isSuccess}`,
      );

      if (transactionId) {
        // Delegate to the shared atomic idempotent handler
        const result = await this.processConfirmedPayment(
          transactionId,
          isSuccess,
          'redirect',
          pgTransactionId,
        );
        receiptNumber = result.receiptNumber;
      } else {
        this.logger.warn(`No transactionId found in the decrypted response.`);
      }

      return {
        success: isSuccess,
        data: responseData,
        orderStatus: orderStatusStr
          ? orderStatusStr.charAt(0).toUpperCase() + orderStatusStr.slice(1)
          : 'Unknown',
        transactionId: transactionId,
        amount: responseData['amount'],
        receiptNumber,
      };
    } catch (error: any) {
      this.logger.error(
        `Error verifying payment response: ${error.message}\nStack: ${error.stack}`,
      );
      return {
        success: false,
        message: 'Invalid payment response signature or data',
        error: error.message,
      };
    }
  }

  // ===========================================================================
  // NEW: handleDexpertWebhook
  //
  // Called by Sir (Dexpert admin) to manually confirm a payment as SUCCESS.
  //
  // Flow:
  //   1. Sir checks Dexpert merchant dashboard – sees which transactions succeeded.
  //   2. For each confirmed-success transaction, Sir POSTs:
  //        { "transId": "TXN_ABC123" }
  //   3. This API automatically marks that payment as SUCCESS, updates the order
  //      to PAID, generates a receipt, and logs the change in payment_log.
  //
  // Body  : { "transId": "TXN_ABC123" }   ← only one field required
  // Always SUCCESS – Sir only hits this for payments he has verified are paid.
  //
  // HTTP 200 → acknowledged=true  (always returned for business-logic outcomes)
  // HTTP 500 → acknowledged=false (only for genuine DB/server crashes)
  // ===========================================================================

  async handleDexpertWebhook(
    body: Record<string, any>,
    webhookSecretHeader?: string,
  ): Promise<WebhookHandleResult> {

    // 0. Optional shared-secret check (activate by setting DEXPERT_WEBHOOK_SECRET in env)
    const configuredSecret = this.configService.get<string>('DEXPERT_WEBHOOK_SECRET');
    if (configuredSecret) {
      if (!webhookSecretHeader || webhookSecretHeader !== configuredSecret) {
        this.logger.warn('Webhook: rejected – X-Webhook-Secret missing or incorrect.');
        return { acknowledged: true, outcome: 'authentication_failed' };
      }
    }

    // 1. Validate payload structure
    if (!body || typeof body !== 'object') {
      this.logger.warn('Webhook: received non-object body.');
      return { acknowledged: true, outcome: 'invalid_payload' };
    }

    // 2. Extract transId (accept common field name variants)
    const transactionId: string | undefined =
      body['transId'] ||
      body['transaction_id'] ||
      body['transactionId'] ||
      body['txnId'] ||
      body['txn_id'] ||
      undefined;

    if (!transactionId) {
      this.logger.warn(
        `Webhook: missing transId. Received keys: [${Object.keys(body).join(', ')}]`,
      );
      // Write a log entry for the missing-field case too
      await this.writePaymentLog({
        transactionId: undefined,
        previousStatus: undefined,
        newStatus: undefined,
        source: 'webhook',
        rawPayload: body,
        outcome: 'missing_fields',
      });
      return { acknowledged: true, outcome: 'missing_fields' };
    }

    this.logger.log(
      `Webhook received: transId=${transactionId} – marking as SUCCESS (Sir-verified)`,
    );

    // 3. Look up the payment record (for audit / to get previous status)
    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .where('LOWER(payment.transactionId) = LOWER(:tid)', { tid: transactionId })
      .getOne();

    if (!payment) {
      this.logger.warn(`Webhook: unknown transactionId=${transactionId}.`);
      await this.writePaymentLog({
        transactionId,
        previousStatus: undefined,
        newStatus: undefined,
        source: 'webhook',
        rawPayload: body,
        outcome: 'unknown_transaction',
      });
      return { acknowledged: true, outcome: 'unknown_transaction', transactionId };
    }

    const previousStatus = String(payment.status);

    // 4. Record webhook audit trail (non-critical – outside main transaction)
    try {
      payment.webhookAttempts = (payment.webhookAttempts ?? 0) + 1;
      if (!payment.webhookReceivedAt) {
        payment.webhookReceivedAt = new Date();
      }
      await this.paymentRepository.save(payment);
    } catch (trackErr: any) {
      // Non-fatal: tracking failure must not block payment processing
      this.logger.warn(`Webhook: audit tracking update failed: ${trackErr.message}`);
    }

    // 5. Apply atomic idempotent status update – always SUCCESS (Sir verified it)
    try {
      const result = await this.processConfirmedPayment(
        transactionId,
        true, // always SUCCESS – Sir only calls this for confirmed payments
        'webhook',
      );

      const latestStatus = result.newStatus ?? previousStatus;

      // 6. Write payment_log entry
      await this.writePaymentLog({
        payment,
        transactionId,
        previousStatus,
        newStatus: latestStatus,
        source: 'webhook',
        rawPayload: body,
        outcome: result.outcome,
      });

      this.logger.log(
        `Webhook complete: transId=${transactionId} outcome=${result.outcome} ` +
          `${previousStatus} -> ${latestStatus}` +
          (result.receiptNumber ? ` receipt=${result.receiptNumber}` : ''),
      );

      return {
        acknowledged: true,
        outcome: result.outcome,
        transactionId,
        previousStatus,
        latestStatus,
        receiptNumber: result.receiptNumber,
        orderId: payment.order?.id,
      };
    } catch (dbError: any) {
      // DB failure → acknowledged=false
      this.logger.error(
        `Webhook: DB error for txnId=${transactionId}: ${dbError.message}`,
      );
      return { acknowledged: false, outcome: 'db_error', transactionId };
    }
  }

  // ===========================================================================
  // PRIVATE: writePaymentLog
  //
  // Saves a row to the payment_log table. Non-fatal – errors are only logged.
  // ===========================================================================

  private async writePaymentLog(opts: {
    payment?: Payment;
    transactionId?: string;
    previousStatus?: string;
    newStatus?: string;
    source?: string;
    rawPayload?: any;
    outcome?: string;
  }): Promise<void> {
    try {
      const log = this.paymentLogRepository.create({
        payment: opts.payment,
        transactionId: opts.transactionId,
        previousStatus: opts.previousStatus,
        newStatus: opts.newStatus,
        source: opts.source,
        rawPayload: opts.rawPayload ? JSON.stringify(opts.rawPayload) : undefined,
        outcome: opts.outcome,
      });
      await this.paymentLogRepository.save(log);
    } catch (logErr: any) {
      // Never let a log write crash the main flow
      this.logger.warn(`Failed to write payment_log entry: ${logErr.message}`);
    }
  }

  // ===========================================================================
  // EXISTING: getReceiptByNumber (unchanged)
  // ===========================================================================

  async getReceiptByNumber(receiptNumber: string) {
    const payment = await this.paymentRepository.findOne({
      where: { receiptNumber },
      relations: [
        'order',
        'order.customer',
        'order.listedOrders',
        'order.listedOrders.product',
      ],
    });

    if (!payment) {
      return null;
    }

    const items = (payment.order?.listedOrders || []).map((item) => {
      const unitPrice = Number(item.amount ?? 0);
      const quantity = Number(item.quantity ?? 0);
      const lineTotal = Number(item.discountedAmount ?? unitPrice * quantity);

      return {
        name: item.product?.label || item.productName || 'Item',
        quantity,
        unitPrice,
        lineTotal,
      };
    });

    return {
      receiptNumber: payment.receiptNumber,
      transactionId: payment.transactionId,
      amount: payment.amount,
      paymentStatus: payment.status,
      orderId: payment.order?.id,
      customerName: payment.order?.customer?.fullName,
      orderPaymentStatus: payment.order?.paymentStatus,
      orderTotal: payment.order?.grandTotal,
      items,
      createdAt: payment.createdAt,
    };
  }
}
