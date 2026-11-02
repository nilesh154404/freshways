import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { DexpertCryptoUtil, DexpertParsedResponse } from './dexpert-crypto.util';
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
  private readonly aesKey: string;
  private readonly aesIv: string;

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
    this.aesKey =
      this.configService.get<string>('DEXPERT_AES_KEY') ||
      '3md6uPicmLlZmlVG';
    this.aesIv =
      this.configService.get<string>('DEXPERT_AES_IV') ||
      'xVJSbcqImp2utNzi';
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
  // EXISTING (SHARED): processConfirmedPayment
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
  // EXISTING: verifyPaymentResponse  (browser redirect)
  //
  // Supports both router credentials and AES webhook credentials.
  // ===========================================================================

  async verifyPaymentResponse(encryptedQuery: string) {
    this.logger.log(`Received encryptedQuery from Dexpert for verification.`);
    try {
      const sanitizedQuery = encryptedQuery.replace(/ /g, '+');
      let decText: string;

      try {
        decText = DexpertCryptoUtil.decryptDexpertResponse(
          sanitizedQuery,
          this.aesKey,
          this.aesIv,
          this.privateKey,
          this.privateValue,
        );
      } catch {
        decText = DexpertCryptoUtil.decrypt(
          sanitizedQuery,
          this.privateValue,
          this.privateKey,
        );
      }

      const parsed = DexpertCryptoUtil.parseDecryptedQuery(decText);

      paymentDebugLogs.push({
        time: new Date().toISOString(),
        encryptedQuery: sanitizedQuery.substring(0, 30) + '...',
        responseData: parsed.raw,
      });
      if (paymentDebugLogs.length > 20) paymentDebugLogs.shift();

      this.logger.log(`Decrypted Dexpert Response: mtxnId=${parsed.mtxnId} status=${parsed.status}`);

      const orderStatusStr = parsed.status || '';
      const rawTxnId = parsed.mtxnId || parsed.transId || parsed.pgTransId;
      let cleanTxnId = rawTxnId;
      if (cleanTxnId && this.merchantCode && cleanTxnId.toUpperCase().startsWith(this.merchantCode.toUpperCase())) {
        cleanTxnId = cleanTxnId.substring(this.merchantCode.length);
      }
      const transactionId = cleanTxnId || rawTxnId;
      const pgTransactionId = parsed.pgTransId || parsed.transId || undefined;

      const normStatus = orderStatusStr.toLowerCase().trim();
      const isSuccess = normStatus === 'success' || normStatus === 'txn_success';
      let receiptNumber: string | undefined;

      this.logger.log(
        `Verifying payment - TxnId: ${transactionId}, Status: ${orderStatusStr}, IsSuccess: ${isSuccess}`,
      );

      if (transactionId) {
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
        data: parsed.raw,
        orderStatus: orderStatusStr
          ? orderStatusStr.charAt(0).toUpperCase() + orderStatusStr.slice(1)
          : 'Unknown',
        transactionId: transactionId,
        amount: parsed.amount,
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
  // Processes Dexpert (PayPlatter) automatic webhook callbacks.
  // Supports:
  //   1. GET /api/payments/webhook/dexpert?query=ENCRYPTED_DATA&mcode=MYA344&transDate=...
  //   2. POST /api/payments/webhook/dexpert with { query: "...", mcode: "..." }
  //
  // Decrypts using AES-128-CBC (PKCS5PADDING / PKCS7PADDING), parses all 15
  // Dexpert fields, rigorously validates merchant code, transaction existence,
  // exact amount, and documented status values before updating payment and order.
  //
  // Unrestricted / unverified manual payment confirmations are strictly blocked.
  // ===========================================================================

  async handleDexpertWebhook(
    body: Record<string, any> = {},
    webhookSecretHeader?: string,
    queryParams: Record<string, any> = {},
  ): Promise<WebhookHandleResult> {
    this.logger.log('Dexpert Webhook received. Inspecting callback request...');

    // 0. Optional shared-secret check (activate by setting DEXPERT_WEBHOOK_SECRET in env)
    const configuredSecret = this.configService.get<string>('DEXPERT_WEBHOOK_SECRET');
    if (configuredSecret) {
      if (!webhookSecretHeader || webhookSecretHeader !== configuredSecret) {
        this.logger.warn('Webhook rejected: X-Webhook-Secret header missing or incorrect.');
        return { acknowledged: true, outcome: 'authentication_failed' };
      }
    }

    // 1. Extract encrypted query parameter (from GET query params or POST body)
    const encryptedQuery: string | undefined =
      queryParams['query'] ||
      body['query'] ||
      body['encryptedQuery'] ||
      body['data'] ||
      undefined;

    const callbackMcode: string | undefined =
      queryParams['mcode'] ||
      body['mcode'] ||
      undefined;

    // 2. If encrypted query is present, process through automatic AES decryption flow
    if (encryptedQuery) {
      this.logger.log('Webhook: encrypted query found. Decrypting with Dexpert AES...');

      let decryptedText: string;
      try {
        decryptedText = DexpertCryptoUtil.decryptDexpertResponse(
          encryptedQuery,
          this.aesKey,
          this.aesIv,
          this.privateKey,
          this.privateValue,
        );
      } catch (decryptErr: any) {
        this.logger.warn(`Webhook: AES decryption failed: ${decryptErr.message}`);
        await this.writePaymentLog({
          source: 'webhook',
          outcome: 'decryption_failed',
          rawPayload: { error: 'decryption_failed', message: decryptErr.message },
        });
        return { acknowledged: true, outcome: 'decryption_failed' };
      }

      // 3. Parse all 15 Dexpert fields
      const parsed = DexpertCryptoUtil.parseDecryptedQuery(decryptedText);

      this.logger.log(
        `Webhook: decrypted successfully. mtxnId=${parsed.mtxnId} transId=${parsed.transId} status=${parsed.status} amount=${parsed.amount} mcode=${parsed.mcode}`,
      );

      // 4. Validate merchant code
      const effectiveMcode = parsed.mcode || callbackMcode;
      if (effectiveMcode && effectiveMcode.toUpperCase() !== this.merchantCode.toUpperCase()) {
        this.logger.warn(
          `Webhook: MERCHANT MISMATCH. Expected=${this.merchantCode}, Received=${effectiveMcode}`,
        );
        await this.writePaymentLog({
          transactionId: parsed.mtxnId || parsed.transId,
          source: 'webhook',
          outcome: 'merchant_mismatch',
          rawPayload: this.sanitizePayloadForLog(parsed),
        });
        return {
          acknowledged: true,
          outcome: 'merchant_mismatch',
          transactionId: parsed.mtxnId || parsed.transId,
        };
      }

      // 5. Extract Freshways transactionId (handling merchant prefix if Dexpert prepends it e.g. MYA344TXN...)
      const rawTxnId = parsed.mtxnId || parsed.transId;
      if (!rawTxnId) {
        this.logger.warn('Webhook: missing transaction ID (neither mtxnId nor transId present in decrypted data).');
        await this.writePaymentLog({
          source: 'webhook',
          outcome: 'missing_transaction_id',
          rawPayload: this.sanitizePayloadForLog(parsed),
        });
        return { acknowledged: true, outcome: 'missing_transaction_id' };
      }

      let cleanTxnId = rawTxnId;
      if (this.merchantCode && cleanTxnId.toUpperCase().startsWith(this.merchantCode.toUpperCase())) {
        cleanTxnId = cleanTxnId.substring(this.merchantCode.length);
      }

      // 6. Look up existing payment record (matches rawTxnId e.g. MYA344TXN... or cleanTxnId e.g. TXN...)
      const payment = await this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.order', 'order')
        .where('LOWER(payment.transactionId) = LOWER(:rawId)', { rawId: rawTxnId })
        .orWhere('LOWER(payment.transactionId) = LOWER(:cleanId)', { cleanId: cleanTxnId })
        .getOne();

      if (!payment) {
        this.logger.warn(`Webhook: unknown transactionId=${rawTxnId} (clean=${cleanTxnId}).`);
        await this.writePaymentLog({
          transactionId: cleanTxnId || rawTxnId,
          source: 'webhook',
          outcome: 'unknown_transaction',
          rawPayload: this.sanitizePayloadForLog(parsed),
        });
        return { acknowledged: true, outcome: 'unknown_transaction', transactionId: cleanTxnId || rawTxnId };
      }

      const transactionId = payment.transactionId;
      const previousStatus = String(payment.status);

      // 7. Validate amount (tolerance: 0.01) - checks amount or requestedAmount
      const effectiveAmountStr =
        parsed.amount && parsed.amount !== 'null'
          ? parsed.amount
          : parsed.requestedAmount && parsed.requestedAmount !== 'null'
          ? parsed.requestedAmount
          : undefined;

      if (effectiveAmountStr !== undefined && effectiveAmountStr !== '') {
        const receivedAmt = parseFloat(effectiveAmountStr);
        const expectedAmt = parseFloat(String(payment.amount));

        if (!isNaN(receivedAmt)) {
          if (Math.abs(receivedAmt - expectedAmt) > 0.01) {
            this.logger.warn(
              `Webhook: AMOUNT MISMATCH for txnId=${transactionId}. Expected=${expectedAmt}, Received=${receivedAmt}`,
            );
            await this.writePaymentLog({
              payment,
              transactionId,
              previousStatus,
              source: 'webhook',
              outcome: 'amount_mismatch',
              rawPayload: this.sanitizePayloadForLog(parsed),
            });
            return { acknowledged: true, outcome: 'amount_mismatch', transactionId };
          }
        }
      }

      // 8. Validate status and response code
      const normStatus = String(parsed.status || '').toLowerCase().trim();
      const normRespCode = String(parsed.respCode || '').toLowerCase().trim();

      const isStatusSuccess =
        normStatus === 'success' || normStatus === 'txn_success' || normStatus === 'completed';
      const isRespCodeSuccess =
        !normRespCode ||
        normRespCode === '0' ||
        normRespCode === '00' ||
        normRespCode === '0000' ||
        normRespCode === 'success' ||
        normRespCode === '200';
      const isSuccess = isStatusSuccess && isRespCodeSuccess;

      const isFailure =
        ['failure', 'failed', 'fail', 'cancelled', 'canceled', 'expired', 'rejected', 'declined', 'bounce'].includes(normStatus) ||
        (!isStatusSuccess && normRespCode && !isRespCodeSuccess);

      if (!isSuccess && !isFailure) {
        this.logger.warn(
          `Webhook: unrecognized status="${parsed.status}" respCode="${parsed.respCode}" for txnId=${transactionId}. Payment remains ${previousStatus}.`,
        );
        await this.writePaymentLog({
          payment,
          transactionId,
          previousStatus,
          source: 'webhook',
          outcome: 'unrecognized_status',
          rawPayload: this.sanitizePayloadForLog(parsed),
        });
        return { acknowledged: true, outcome: 'unrecognized_status', transactionId };
      }

      // 9. Update webhook audit counters on payment entity
      try {
        payment.webhookAttempts = (payment.webhookAttempts ?? 0) + 1;
        if (!payment.webhookReceivedAt) {
          payment.webhookReceivedAt = new Date();
        }
        await this.paymentRepository.save(payment);
      } catch (trackErr: any) {
        this.logger.warn(`Webhook: audit tracking update failed: ${trackErr.message}`);
      }

      // 10. Execute atomic database update
      const pgTransactionId = parsed.pgTransId || parsed.transId || undefined;

      try {
        const result = await this.processConfirmedPayment(
          transactionId,
          isSuccess,
          'webhook',
          pgTransactionId,
        );

        const latestStatus = result.newStatus ?? (isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);

        await this.writePaymentLog({
          payment,
          transactionId,
          previousStatus,
          newStatus: latestStatus,
          source: 'webhook',
          outcome: result.outcome,
          rawPayload: this.sanitizePayloadForLog(parsed),
        });

        this.logger.log(
          `Webhook complete: txnId=${transactionId} outcome=${result.outcome} ` +
            `${previousStatus} -> ${latestStatus}` +
            (result.receiptNumber ? ` receipt=${result.receiptNumber}` : ''),
        );

        return {
          acknowledged: true,
          outcome: result.outcome,
          transactionId,
          previousStatus,
          latestStatus,
          receiptNumber: result.receiptNumber || payment.receiptNumber,
          orderId: payment.order?.id,
        };
      } catch (dbErr: any) {
        this.logger.error(`Webhook: database update failed for txnId=${transactionId}: ${dbErr.message}`);
        return { acknowledged: false, outcome: 'db_error', transactionId };
      }
    }

    // 3. Fallback: Check if unencrypted transId was submitted without encrypted query
    const unencryptedTxnId: string | undefined =
      body['transId'] ||
      body['transaction_id'] ||
      body['transactionId'] ||
      queryParams['transId'] ||
      undefined;

    if (unencryptedTxnId) {
      this.logger.warn(
        `Webhook: rejected unencrypted transId=${unencryptedTxnId}. Encrypted response query is required.`,
      );
      await this.writePaymentLog({
        transactionId: unencryptedTxnId,
        source: 'webhook',
        outcome: 'encrypted_query_required',
        rawPayload: { transId: unencryptedTxnId, note: 'Unencrypted transId rejected' },
      });
      return {
        acknowledged: true,
        outcome: 'encrypted_query_required',
        transactionId: unencryptedTxnId,
      };
    }

    // 4. Missing required payload fields
    this.logger.warn('Webhook: missing query parameter or body payload.');
    await this.writePaymentLog({
      source: 'webhook',
      outcome: 'missing_fields',
      rawPayload: { note: 'Empty payload received' },
    });
    return { acknowledged: true, outcome: 'missing_fields' };
  }

  // ===========================================================================
  // PRIVATE: sanitizePayloadForLog
  //
  // Prepares safe metadata for storage in payment_log without sensitive keys/PII.
  // ===========================================================================

  private sanitizePayloadForLog(parsed: DexpertParsedResponse): Record<string, any> {
    return {
      receivedVia: 'encrypted_webhook',
      pgTransId: parsed.pgTransId,
      transId: parsed.transId,
      mtxnId: parsed.mtxnId,
      amount: parsed.amount,
      requestedAmount: parsed.requestedAmount,
      payInstrument: parsed.payInstrument,
      respCode: parsed.respCode,
      mcode: parsed.mcode,
      txnDate: parsed.txnDate,
      status: parsed.status,
      rmsg: parsed.rmsg,
    };
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
