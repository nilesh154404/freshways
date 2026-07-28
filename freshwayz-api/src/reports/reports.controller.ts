import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('generate')
  @ApiOperation({ summary: 'Generate and download business reports' })
  @ApiQuery({ name: 'type', required: true, example: 'sales', description: 'sales, vendors, users, subscriptions' })
  @ApiQuery({ name: 'dateFrom', required: true, example: '2026-01-01', description: 'Start Date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: true, example: '2026-12-31', description: 'End Date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'format', required: false, example: 'csv', description: 'csv, excel, pdf' })
  async generateReport(
    @Query('type') type: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('format') format: string = 'csv',
    @Res() res: Response,
  ) {
    if (!type || !dateFrom || !dateTo) {
      throw new BadRequestException('Missing required parameters: type, dateFrom, dateTo');
    }

    try {
      const reportData = await this.reportsService.generateReport(type, dateFrom, dateTo, format);
      const extension = format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase();
      const filename = `${type}_report_${dateFrom}_to_${dateTo}.${extension}`;

      let contentType = 'text/csv';
      if (format.toLowerCase() === 'pdf') {
        contentType = 'application/pdf';
      } else if (format.toLowerCase() === 'excel') {
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(reportData);
    } catch (error: any) {
      res.status(error.status || 500).json({
        statusCode: error.status || 500,
        message: error.message || 'Internal server error while generating report',
      });
    }
  }
}
