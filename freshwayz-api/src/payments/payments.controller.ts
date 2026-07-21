import { Controller, Get, Post, Body, Query, Param, Res, Req, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import type { Request, Response } from 'express';
import PDFDocument from 'pdfkit';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  async initiatePayment(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentsService.initiatePayment(createPaymentDto);
  }

  @Get('response')
  async handlePaymentResponse(
    @Query('query') query: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!query) {
      res.status(400).json({ success: false, message: 'Missing query parameter' });
      return;
    }
    console.log('Received query parameter:', query);
    const verificationResult = await this.paymentsService.verifyPaymentResponse(query);
    const transactionId = verificationResult.transactionId || '';
    const success = verificationResult.success ? 'true' : 'false';
    const status = verificationResult.orderStatus || 'Unknown';
    const receiptNumber = verificationResult.receiptNumber || '';
    const redirectUrl = `freshways://gateway?success=${success}&txnId=${encodeURIComponent(transactionId)}&status=${encodeURIComponent(status)}&receiptNumber=${encodeURIComponent(receiptNumber)}`;
    const receiptViewUrl = receiptNumber
      ? `/api/payments/receipt/${encodeURIComponent(receiptNumber)}`
      : '';
    const receiptDownloadUrl = receiptNumber
      ? `/api/payments/receipt/${encodeURIComponent(receiptNumber)}/download`
      : '';
    
    // === OLD CODE (Commented out to fix mobile white screen) ===
    // In a real application, you might want to redirect to a frontend page:
    // return res.redirect(`http://localhost:4200/payment/status?success=${verificationResult.success}&txnId=${verificationResult.transactionId}`);
    // return res.json(verificationResult); 
    // ==========================================================

    // === NEW CODE (Supports both browser callback pages and mobile deep links) ===
    // Browsers render a receipt page with download/print actions.
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('text/html')) {
      res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Payment ${success === 'true' ? 'Successful' : 'Failed'}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f6faf6; color: #123; }
      .card { max-width: 560px; margin: 8vh auto; background: #fff; border: 1px solid #d8e6d8; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
      h1 { margin-top: 0; font-size: 24px; }
      p { line-height: 1.5; }
      a, button { color: #0f7a3d; word-break: break-all; }
      .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 18px; }
      .button { display: inline-block; border: 1px solid #0f7a3d; padding: 10px 14px; border-radius: 10px; text-decoration: none; }
      .button.primary { background: #0f7a3d; color: #fff; }
      .meta { background: #f2f7f2; border-radius: 12px; padding: 12px 14px; margin: 16px 0; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Payment ${success === 'true' ? 'Successful' : 'Failed'}</h1>
      <p>Your payment has been processed. Use the receipt links below to view or download it.</p>
      <div class="meta">
        <div><strong>Transaction ID:</strong> ${transactionId || 'N/A'}</div>
        <div><strong>Status:</strong> ${status}</div>
        <div><strong>Receipt Number:</strong> ${receiptNumber || 'Generating...'}</div>
      </div>
      <div class="actions">
        ${receiptViewUrl ? `<a class="button primary" href="${receiptViewUrl}">View Receipt</a>` : ''}
        ${receiptDownloadUrl ? `<a class="button" href="${receiptDownloadUrl}">Download Receipt</a>` : ''}
        <a class="button" href="${redirectUrl}">Open App</a>
      </div>
    </div>
  </body>
</html>`);
      return;
    }

    res.redirect(302, redirectUrl);
    return;
    // ==========================================================
  }

  @Get('receipt/:receiptNumber')
  async viewReceipt(
    @Param('receiptNumber') receiptNumber: string,
    @Res() res: Response,
  ) {
    if (!receiptNumber) {
      throw new BadRequestException('Missing receipt number');
    }

    const receipt = await this.paymentsService.getReceiptByNumber(receiptNumber);
    if (!receipt) {
      throw new NotFoundException(`Receipt ${receiptNumber} not found`);
    }

    const downloadUrl = `/api/payments/receipt/${encodeURIComponent(receiptNumber)}/download`;

    res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Receipt ${receipt.receiptNumber}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f6faf6; color: #123; }
      .card { max-width: 820px; margin: 8vh auto; background: #fff; border: 1px solid #d8e6d8; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
      h1 { margin-top: 0; }
      .meta { background: #f2f7f2; border-radius: 12px; padding: 12px 14px; margin: 16px 0; font-size: 14px; }
      .section-title { font-size: 16px; font-weight: 700; margin: 18px 0 10px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e4eee4; font-size: 14px; }
      th { background: #f7fbf7; }
      .summary { display: flex; justify-content: space-between; align-items: center; background: #edf7ed; border-radius: 12px; padding: 12px 14px; margin-top: 16px; font-weight: 700; }
      .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 18px; }
      .button { display: inline-block; border: 1px solid #0f7a3d; padding: 10px 14px; border-radius: 10px; text-decoration: none; color: #0f7a3d; }
      .button.primary { background: #0f7a3d; color: #fff; }
      .muted { color: #587058; }
      @media print { .actions { display: none; } body { background: #fff; } .card { box-shadow: none; border: none; margin: 0; } }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Receipt</h1>
      <div class="meta">
        <div><strong>Customer Name:</strong> ${receipt.customerName || 'N/A'}</div>
        <div><strong>Receipt Number:</strong> ${receipt.receiptNumber}</div>
        <div><strong>Transaction ID:</strong> ${receipt.transactionId || 'N/A'}</div>
        <div><strong>Order ID:</strong> ${receipt.orderId || 'N/A'}</div>
        <div><strong>Amount:</strong> ${receipt.amount}</div>
        <div><strong>Payment Status:</strong> ${receipt.paymentStatus}</div>
        <div><strong>Order Payment Status:</strong> ${receipt.orderPaymentStatus || 'N/A'}</div>
        <div><strong>Created At:</strong> ${receipt.createdAt ? new Date(receipt.createdAt).toLocaleString() : 'N/A'}</div>
      </div>
      <div class="section-title">Order Details</div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${(receipt.items || []).map((item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${Number(item.unitPrice).toFixed(2)}</td>
              <td>${Number(item.lineTotal).toFixed(2)}</td>
            </tr>
          `).join('') || '<tr><td colspan="4" class="muted">No order items found</td></tr>'}
        </tbody>
      </table>
      <div class="summary">
        <span>Order Total</span>
        <span>${Number(receipt.orderTotal ?? receipt.amount ?? 0).toFixed(2)}</span>
      </div>
      <div class="actions">
        <a class="button primary" href="${downloadUrl}">Download Receipt</a>
        <button class="button" onclick="window.print()">Print / Save as PDF</button>
      </div>
    </div>
  </body>
</html>`);
  }

  @Get('receipt/:receiptNumber/download')
  async downloadReceipt(
    @Param('receiptNumber') receiptNumber: string,
    @Res() res: Response,
  ) {
    if (!receiptNumber) {
      throw new BadRequestException('Missing receipt number');
    }

    const receipt = await this.paymentsService.getReceiptByNumber(receiptNumber);
    if (!receipt) {
      throw new NotFoundException(`Receipt ${receiptNumber} not found`);
    }

    const filename = `${receipt.receiptNumber}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const document = new PDFDocument({ margin: 40, size: 'A4' });
    document.pipe(res);

    document
      .fontSize(20)
      .fillColor('#0f7a3d')
      .text('Freshways Payment Receipt', { align: 'center' });

    document.moveDown(1.2);
    document.fontSize(12).fillColor('#111');

    const addLine = (label: string, value: string) => {
      document.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      document.font('Helvetica').text(value);
    };

    addLine('Receipt Number', receipt.receiptNumber);
    addLine('Customer Name', receipt.customerName || 'N/A');
    addLine('Transaction ID', receipt.transactionId || 'N/A');
    addLine('Order ID', String(receipt.orderId || 'N/A'));
    addLine('Amount', String(Number(receipt.amount || 0).toFixed(2)));
    addLine('Payment Status', String(receipt.paymentStatus));
    addLine('Order Payment Status', String(receipt.orderPaymentStatus || 'N/A'));
    addLine('Created At', receipt.createdAt ? new Date(receipt.createdAt).toLocaleString() : 'N/A');

    document.moveDown(1);
    document.fontSize(14).fillColor('#0f7a3d').text('Order Details');
    document.moveDown(0.4);

    if ((receipt.items || []).length > 0) {
      document.fontSize(11).fillColor('#111');
      document.text('Product', 40, document.y, { width: 220, continued: true });
      document.text('Qty', { width: 60, continued: true });
      document.text('Unit', { width: 90, continued: true });
      document.text('Line Total');
      document.moveTo(40, document.y + 2).lineTo(555, document.y + 2).strokeColor('#d8e6d8').stroke();
      document.moveDown(0.6);

      (receipt.items || []).forEach((item: any) => {
        document.text(item.name, 40, document.y, { width: 220, continued: true });
        document.text(String(item.quantity), { width: 60, continued: true });
        document.text(Number(item.unitPrice).toFixed(2), { width: 90, continued: true });
        document.text(Number(item.lineTotal).toFixed(2));
      });
    } else {
      document.fontSize(11).fillColor('#666').text('No order items found.');
    }

    document.moveDown(1);
    document.fontSize(13).fillColor('#0f7a3d').text(`Order Total: ${Number(receipt.orderTotal ?? receipt.amount ?? 0).toFixed(2)}`, {
      align: 'right',
    });
    document.moveDown(1.5);
    document.fontSize(12).fillColor('#444').text('Thank you for your payment.', { align: 'center' });

    document.end();
  }
}
