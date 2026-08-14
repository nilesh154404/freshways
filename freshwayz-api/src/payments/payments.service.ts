import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { DexpertCryptoUtil } from './dexpert-crypto.util';
import { Order } from 'src/orders/entities/order.entity';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  // Dexpert Test Gateway Configuration
  private readonly routerDomain: string;
  private readonly username: string;
  private readonly password: string;
  private readonly merchantCode: string;
  private readonly privateKey: string;
  private readonly privateValue: string;

  // URLs for payment gateway response redirects
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
    private readonly configService: ConfigService,
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
      'https://freshwayz.dexpertsystems.com/api/payments/response';
    this.urlFail =
      this.configService.get<string>('DEXPERT_URL_FAIL') ||
      'https://freshwayz.dexpertsystems.com/api/payments/response';
  }

  async initiatePayment(createPaymentDto: CreatePaymentDto) {
    if (!createPaymentDto.orderId) {
      throw new InternalServerErrorException(
        'orderId is required to initiate a payment.',
      );
    }

    // Always generate a completely unique transaction ID to prevent Dexpert "resubmitted" errors 
    // in case the frontend retries with the same transactionId.
    const baseTxnId = createPaymentDto.transactionId ? createPaymentDto.transactionId + '_' : 'TXN';
    const txnId = `${baseTxnId}${Date.now()}_${Math.floor(Math.random() * 10000)}`;
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
      this.logger.log(`Created pending payment for order ${createPaymentDto.orderId} with txnId ${txnId}`);
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
      
      this.logger.log(`Decrypted Dexpert Response: ${JSON.stringify(responseData)}`);

      const orderStatusStr =
        responseData['status'] || responseData['order_status'] || '';
      const transactionId =
        responseData['mtxnId'] || responseData['pg_transt_id'];

      const isSuccess = orderStatusStr.toLowerCase() === 'success';
      let receiptNumber: string | undefined;

      this.logger.log(`Verifying payment - TxnId: ${transactionId}, Status: ${orderStatusStr}, IsSuccess: ${isSuccess}`);

      if (transactionId) {
        // Update DB status
        const payment = await this.paymentRepository.findOne({
          where: { transactionId },
          relations: ['order'],
        });
        if (payment) {
          this.logger.log(`Found payment record for TxnId: ${transactionId}. Updating status...`);
          payment.status = isSuccess
            ? PaymentStatus.SUCCESS
            : PaymentStatus.FAILED;

          if (isSuccess && payment.order?.id) {
            payment.receiptNumber =
              payment.receiptNumber ||
              this.generateReceiptNumber(payment.order.id, transactionId);
            receiptNumber = payment.receiptNumber;
          }

          await this.paymentRepository.save(payment);
          this.logger.log(`Payment record updated successfully. Receipt: ${receiptNumber}`);

          const orderId = payment.order?.id;
          if (orderId) {
            const order = await this.orderRepository.findOne({
              where: { id: orderId },
            });
            if (order) {
              order.paymentStatus = isSuccess ? 'PAID' : 'FAILED';
              await this.orderRepository.save(order);
              this.logger.log(`Order ${orderId} paymentStatus updated to ${order.paymentStatus}`);
            } else {
              this.logger.warn(
                `Payment ${transactionId} saved, but order ${orderId} was not found for status update`,
              );
            }
          } else {
             this.logger.warn(`Payment ${transactionId} has no associated order to update.`);
          }
        } else {
          this.logger.warn(
            `Received payment response for unknown transactionId: ${transactionId}`,
          );
        }
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
      this.logger.error(`Error verifying payment response: ${error.message}\nStack: ${error.stack}`);
      return {
        success: false,
        message: 'Invalid payment response signature or data',
        error: error.message,
      };
    }
  }

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
