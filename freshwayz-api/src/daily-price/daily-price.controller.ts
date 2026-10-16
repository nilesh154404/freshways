import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { DailyPriceService } from './daily-price.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateDailyPriceDto } from './dto/create-daily-price.dto';
import { UpdateDailyPriceDto } from './dto/update-daily-price.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Daily Price')
@Controller('daily-price')
export class DailyPriceController {
  constructor(private readonly dailyPriceService: DailyPriceService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  @ApiOperation({ summary: 'Create daily price' })
  @ApiResponse({ status: 201, description: 'Daily price created successfully' })
  create(@Body() dto: CreateDailyPriceDto, @Req() req: any) {
    return this.dailyPriceService.create(dto, req.user);
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  @ApiOperation({ summary: 'Update daily price' })
  update(@Param('id') id: string, @Body() dto: UpdateDailyPriceDto, @Req() req: any) {
    return this.dailyPriceService.update(+id, dto, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  @ApiOperation({ summary: 'Delete daily price' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.dailyPriceService.remove(+id, req.user);
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
