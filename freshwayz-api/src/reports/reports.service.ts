import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Vendor } from '../vendor/entities/vendor.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  private async formatData(data: any[], format: string, type: string): Promise<string | Buffer> {
    if (!data || data.length === 0) {
      if (format.toLowerCase() === 'csv') return 'No data found for the selected criteria';
    }
    
    switch(format.toLowerCase()) {
      case 'excel':
        return this.generateExcel(data);
      case 'pdf':
        return this.generatePdf(data, type);
      case 'csv':
      default:
        return this.jsonToCsv(data);
    }
  }

  private async generateExcel(data: any[]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Report');
    
    if (!data || data.length === 0) {
      ws.addRow(['No data found for the selected criteria']);
      const buffer = await wb.xlsx.writeBuffer();
      return Buffer.from(buffer);
    }

    const headers = Object.keys(data[0]);
    ws.addRow(headers);
    ws.getRow(1).font = { bold: true };

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        if (val instanceof Date) return val.toISOString();
        return val !== null && val !== undefined ? val : '';
      });
      ws.addRow(values);
    }
    
    ws.columns.forEach(column => {
      column.width = 25;
    });

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer as ArrayBuffer);
  }

  private async generatePdf(data: any[], type: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(18).text(`${type.toUpperCase()} REPORT`, { align: 'center' });
      doc.moveDown();

      if (!data || data.length === 0) {
        doc.fontSize(12).text('No data found for the selected criteria.');
        doc.end();
        return;
      }

      const headers = Object.keys(data[0]);
      
      data.forEach((row, index) => {
        doc.fontSize(12).font('Helvetica-Bold').text(`Record #${index + 1}`);
        headers.forEach(header => {
          let val = row[header];
          if (val instanceof Date) val = val.toISOString();
          const displayVal = val !== null && val !== undefined ? val : 'N/A';
          doc.fontSize(10).font('Helvetica').text(`${header}: ${displayVal}`);
        });
        doc.moveDown();
      });

      doc.end();
    });
  }

  /**
   * Helper to format an array of JSON objects to CSV string (RFC 4180 compliant)
   */
  private jsonToCsv(data: any[]): string {
    if (!data || data.length === 0) {
      return 'No data found for the selected criteria';
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return '';
        if (val instanceof Date) {
          return `"${val.toISOString()}"`;
        }
        const stringVal = String(val);
        if (
          stringVal.includes(',') ||
          stringVal.includes('"') ||
          stringVal.includes('\n') ||
          stringVal.includes('\r')
        ) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\r\n');
  }

  /**
   * Generate CSV data based on report type and date range
   */
  async generateReport(
    type: string,
    dateFromStr: string,
    dateToStr: string,
    format: string = 'csv',
  ): Promise<string | Buffer> {
    const fromDate = new Date(dateFromStr);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(dateToStr);
    toDate.setHours(23, 59, 59, 999);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date parameters');
    }

    switch (type.toLowerCase()) {
      case 'sales': {
        const orders = await this.orderRepo.find({
          where: {
            createdAt: Between(fromDate, toDate),
          },
          relations: ['customer', 'vendor'],
          order: { id: 'DESC' },
        });

        const mappedData = orders.map((order) => ({
          'Order ID': order.id,
          'Customer Name': order.customer?.fullName || 'N/A',
          'Customer Phone': order.customer?.phone || 'N/A',
          'Vendor Business Name': order.vendor?.businessName || 'N/A',
          'Grand Total': order.grandTotal,
          'Order Status': order.orderStatus,
          'Payment Status': order.paymentStatus,
          'Created At': order.createdAt,
        }));

        return this.formatData(mappedData, format, type);
      }

      case 'vendors': {
        const vendorsData = await this.vendorRepo
          .createQueryBuilder('vendor')
          .leftJoin(
            'vendor.orders',
            'order',
            'order.createdAt BETWEEN :fromDate AND :toDate',
            { fromDate, toDate },
          )
          .select([
            'vendor.id AS `Vendor ID`',
            'vendor.businessName AS `Business Name`',
            'vendor.ownerName AS `Owner Name`',
            'vendor.email AS `Email`',
            'COUNT(order.id) AS `Total Orders`',
            'COALESCE(SUM(order.grandTotal), 0) AS `Total Sales (Rs)`',
          ])
          .groupBy('vendor.id')
          .getRawMany();

        return this.formatData(vendorsData, format, type);
      }

      case 'users': {
        const customersData = await this.customerRepo
          .createQueryBuilder('customer')
          .leftJoin('customer.orders', 'order')
          .leftJoin('customer.subscriptions', 'subscription')
          .select([
            'customer.id AS `Customer ID`',
            'customer.fullName AS `Full Name`',
            'customer.email AS `Email`',
            'customer.phone AS `Phone`',
            'customer.createdAt AS `Joined At`',
            'COUNT(DISTINCT order.id) AS `Total Orders`',
            'COUNT(DISTINCT subscription.id) AS `Total Subscriptions`',
          ])
          .where('customer.createdAt BETWEEN :fromDate AND :toDate', {
            fromDate,
            toDate,
          })
          .groupBy('customer.id')
          .getRawMany();

        return this.formatData(customersData, format, type);
      }

      case 'subscriptions': {
        const subscriptions = await this.subscriptionRepo.find({
          where: {
            startDate: Between(fromDate, toDate),
          },
          relations: ['customer', 'plan'],
          order: { id: 'DESC' },
        });

        const mappedData = subscriptions.map((sub) => ({
          'Subscription ID': sub.id,
          'Customer Name': sub.customer?.fullName || 'N/A',
          'Customer Phone': sub.customer?.phone || 'N/A',
          'Plan Name': sub.plan?.label || 'N/A',
          'Plan Price (Rs)': sub.plan?.price || 0,
          'Duration': sub.plan?.duration || 'N/A',
          'Start Date': sub.startDate,
          'End Date': sub.endDate || 'N/A',
          'Status': sub.active ? 'Active' : 'Inactive',
        }));

        return this.formatData(mappedData, format, type);
      }

      default:
        throw new BadRequestException(`Unknown report type: ${type}`);
    }
  }
}
