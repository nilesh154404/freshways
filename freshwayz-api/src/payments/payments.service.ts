import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { DexpertCryptoUtil } from './dexpert-crypto.util';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';

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

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly configService: ConfigService,
  ) {
    // this.routerDomain = this.configService.get<string>('DEXPERT_ROUTER_DOMAIN') || "https://dexpertsystems.com/Router/initiateTransaction";
    // this.username = this.configService.get<string>('DEXPERT_USERNAME') || "MPANKA261";
    // this.password = this.configService.get<string>('DEXPERT_PASSWORD') || "[C@445aba30";
    // this.merchantCode = this.configService.get<string>('DEXPERT_MERCHANT_CODE') || "THE265";
    // this.privateKey = this.configService.get<string>('DEXPERT_PRIVATE_KEY') || "Wq0F6lS7A5tIJU90";
    // this.privateValue = this.configService.get<string>('DEXPERT_PRIVATE_VALUE') || "lo4syhqHnRjm4L0T";
    // this.urlSuccess = this.configService.get<string>('DEXPERT_URL_SUCCESS') || "http://localhost:3000/payments/response";
    // this.urlFail = this.configService.get<string>('DEXPERT_URL_FAIL') || "http://localhost:3000/payments/response";
    this.routerDomain = this.configService.get<string>('DEXPERT_ROUTER_DOMAIN') || "https://dexpertsystems.com/Router/initiateTransaction";
    this.username = this.configService.get<string>('DEXPERT_USERNAME') || "MSANDY344";
    this.password = this.configService.get<string>('DEXPERT_PASSWORD') || "[C@2e2789b";
    this.merchantCode = this.configService.get<string>('DEXPERT_MERCHANT_CODE') || "MYA344";
    this.privateKey = this.configService.get<string>('DEXPERT_PRIVATE_KEY') || "HQ9ej2ncdwnbIB5a";
    this.privateValue = this.configService.get<string>('DEXPERT_PRIVATE_VALUE') || "wmJRtH4WKvv733tF";
    this.urlSuccess = this.configService.get<string>('DEXPERT_URL_SUCCESS') || "freshways://gateway?success=${verificationResult.success}&txnId=${verificationResult.transactionId}";
    this.urlFail = this.configService.get<string>('DEXPERT_URL_FAIL') || "freshways://gateway?success=${verificationResult.success}&txnId=${verificationResult.transactionId}";
  }

  async initiatePayment(createPaymentDto: CreatePaymentDto) {
    if (!createPaymentDto.orderId) {
      throw new InternalServerErrorException('orderId is required to initiate a payment.');
    }

    const txnId = createPaymentDto.transactionId || `TXN${Date.now()}`;
    const txnAmt = createPaymentDto.amount;

    // Save pending payment to DB
    try {
      const newPayment = this.paymentRepository.create({
        order: { id: createPaymentDto.orderId },
        method: PaymentMethod.ONLINE,
        status: PaymentStatus.PENDING,
        amount: txnAmt,
        transactionId: txnId
      });
      await this.paymentRepository.save(newPayment);
    } catch (error: any) {
      this.logger.error(`Failed to create pending payment record: ${error.message}`);
      throw new InternalServerErrorException(`Could not initiate payment in the database. Ensure orderId ${createPaymentDto.orderId} exists. Error: ${error.message}`);
    }

    const customerName = createPaymentDto.customerName || '';
    const pfname = customerName.split(' ')[0] || '';
    const plname = customerName.split(' ').slice(1).join(' ') || '';
    const pmno = createPaymentDto.phoneNumber || '';
    const pemail = createPaymentDto.email || '';
    const settlement_split = `online_${txnAmt}~`;

    const routerUrl = `?mcode=${this.merchantCode}&uname=${this.username}&psw=${this.password}&amount=${txnAmt}&settlement_split=${settlement_split}&mtxnId=${txnId}&pfname=${pfname}&plname=${plname}&pmno=${pmno}&pemail=${pemail}&padd=&surl=${this.urlSuccess}&furl=${this.urlFail}&udf6=`;

    const encryptedUrl = DexpertCryptoUtil.encrypt(routerUrl, this.privateValue, this.privateKey);
    // URL encode the '+' sign
    const finalEncryptedUrl = encryptedUrl.replace(/\+/g, '%2B');

    const query = `?query=${finalEncryptedUrl}&mcode=${this.merchantCode}`;
    const fullPaymentUrl = `${this.routerDomain}${query}`;

    return {
      paymentUrl: fullPaymentUrl,
      transactionId: txnId,
      encryptedQuery: finalEncryptedUrl,
      merchantCode: this.merchantCode
    };
  }

  async verifyPaymentResponse(encryptedQuery: string) {
    try {
      // Browsers often convert '+' to ' ' in query parameters. 
      // We must revert spaces back to '+' for base64 decryption to work!
      const sanitizedQuery = encryptedQuery.replace(/ /g, '+');
      const decText = DexpertCryptoUtil.decrypt(sanitizedQuery, this.privateValue, this.privateKey);
      
      const decryptValues = decText.split('&');
      
      const responseData: Record<string, string> = {};
      decryptValues.forEach(val => {
        const [key, value] = val.split('=');
        if (key) {
          responseData[key] = value || '';
        }
      });

      const orderStatusStr = responseData['status'] || responseData['order_status'] || '';
      const transactionId = responseData['mtxnId'] || responseData['pg_transt_id'];
      
      const isSuccess = orderStatusStr.toLowerCase() === 'success';

      if (transactionId) {
         // Update DB status
         const payment = await this.paymentRepository.findOne({ where: { transactionId } });
         if (payment) {
           payment.status = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
           await this.paymentRepository.save(payment);
         } else {
           this.logger.warn(`Received payment response for unknown transactionId: ${transactionId}`);
         }
      }

      return {
        success: isSuccess,
        data: responseData,
        orderStatus: orderStatusStr ? orderStatusStr.charAt(0).toUpperCase() + orderStatusStr.slice(1) : 'Unknown',
        transactionId: transactionId,
        amount: responseData['amount']
      };
    } catch (error: any) {
      this.logger.error(`Error verifying payment response: ${error.message}`);
      return {
        success: false,
        message: 'Invalid payment response signature or data',
        error: error.message
      };
    }
  }
}
