import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { DailyPriceService } from './daily-price.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateDailyPriceDto } from './dto/create-daily-price.dto';
import { UpdateDailyPriceDto } from './dto/update-daily-price.dto';

@ApiTags('Daily Price')
@Controller('daily-price')
export class DailyPriceController {
  constructor(private readonly dailyPriceService: DailyPriceService) {}

  @Post()
  @ApiOperation({ summary: 'Create daily price' })
  @ApiResponse({ status: 201, description: 'Daily price created successfully' })
  create(@Body() dto: CreateDailyPriceDto) {
    return this.dailyPriceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all daily prices' })
  findAll(@Query('vendorId') vendorId?: string, @Query('productId') productId?: string) {
    return this.dailyPriceService.findAll(vendorId ? Number(vendorId) : undefined, productId ? Number(productId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single daily price by ID' })
  findOne(@Param('id') id: string) {
    return this.dailyPriceService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update daily price' })
  update(@Param('id') id: string, @Body() dto: UpdateDailyPriceDto) {
    return this.dailyPriceService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete daily price' })
  remove(@Param('id') id: string) {
    return this.dailyPriceService.remove(+id);
  }

  @Get('product/:productId/history')
  @ApiOperation({ summary: 'Get price history for a product' })
  @ApiResponse({ status: 200, description: 'Returns complete price change history' })
  getPriceHistory(
    @Param('productId') productId: string,
    @Query('vendorId') vendorId?: string
  ) {
    return this.dailyPriceService.getPriceHistory(
      +productId,
      vendorId ? +vendorId : undefined
    );
  }
}
