import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

/**
 * PaymentsReconciliationService
 *
 * Runs on a cron schedule to find PENDING payments that have not been
 * resolved by either the browser redirect or a webhook delivery.
 *
 * Current behaviour:
 *   - Identifies payments pending for more than 30 minutes.
 *   - Calls queryGatewayStatus() for each one.
 *   - queryGatewayStatus() is a STUB that returns null until Dexpert
 *     provides their transaction status inquiry API documentation.
 *   - No payment is expired or failed merely because the webhook has
 *     not arrived; only a confirmed gateway response triggers a change.
 *
 * To activate full reconciliation:
 *   1. Set DEXPERT_STATUS_INQUIRY_URL in .env to the Dexpert API endpoint.
 *   2. Implement the request/response logic inside queryGatewayStatus().
 *   3. Un-comment the processConfirmedPayment call below.
 */
@Injectable()
export class PaymentsReconciliationService {
  private readonly logger = new Logger(PaymentsReconciliationService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  /** Run every 15 minutes – finds PENDING payments older than 30 minutes. */
  @Cron('0 */15 * * * *')
  async reconcilePendingPayments(): Promise<void> {
    this.logger.log('Reconciliation: checking for unresolved payments...');

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const pendingPayments = await this.paymentRepository.find({
      where: {
        status: PaymentStatus.PENDING,
        createdAt: LessThan(thirtyMinutesAgo),
      },
      relations: ['order'],
    });

    if (pendingPayments.length === 0) {
      this.logger.log('Reconciliation: no unresolved payments found.');
      return;
    }

    this.logger.log(
      `Reconciliation: found ${pendingPayments.length} unresolved payment(s).`,
    );

    for (const payment of pendingPayments) {
      try {
        const gatewayResult = await this.queryGatewayStatus(payment.transactionId);

        if (gatewayResult === null) {
          this.logger.warn(
            `Reconciliation: status inquiry API not configured. ` +
              `txnId=${payment.transactionId} orderId=${payment.order?.id} ` +
              `remains PENDING. Set DEXPERT_STATUS_INQUIRY_URL to enable auto-resolution.`,
          );
          continue;
        }

        // Uncomment when queryGatewayStatus is implemented:
        // await this.paymentsService.processConfirmedPayment(
        //   payment.transactionId,
        //   gatewayResult.isSuccess,
        //   'reconciliation',
        // );
      } catch (err: any) {
        // Transient error – leave PENDING, retry next cycle
        this.logger.error(
          `Reconciliation: error for txnId=${payment.transactionId}: ${err.message}`,
        );
      }
    }
  }

  /**
   * Query Dexpert transaction status inquiry API.
   *
   * STUB – returns null until official API documentation is received from Dexpert.
   * DO NOT invent an endpoint, request format, or credentials.
   */
  private async queryGatewayStatus(
    _transactionId: string,
  ): Promise<{ isSuccess: boolean; status: string } | null> {
    const url = this.configService.get<string>('DEXPERT_STATUS_INQUIRY_URL');
    if (!url) return null;

    // TODO: implement once Dexpert provides status inquiry API docs.
    this.logger.warn('queryGatewayStatus: URL configured but implementation is pending.');
    return null;
  }
}
