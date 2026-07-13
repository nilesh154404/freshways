import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import type { Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  async initiatePayment(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentsService.initiatePayment(createPaymentDto);
  }

  @Get('response')
  async handlePaymentResponse(@Query('query') query: string, @Res() res: Response) {
    if (!query) {
      return res.status(400).json({ success: false, message: 'Missing query parameter' });
    }
    
    const verificationResult = await this.paymentsService.verifyPaymentResponse(query);
    
    // === OLD CODE (Commented out to fix mobile white screen) ===
    // In a real application, you might want to redirect to a frontend page:
    // return res.redirect(`http://localhost:4200/payment/status?success=${verificationResult.success}&txnId=${verificationResult.transactionId}`);
    // return res.json(verificationResult); 
    // ==========================================================

    // === NEW CODE (Added to support mobile app deep linking) ===
    // Redirect back to the mobile app instead of returning JSON
    return res.redirect(`freshways://gateway?success=${verificationResult.success}&txnId=${verificationResult.transactionId}`);
    // ==========================================================
  }
}
