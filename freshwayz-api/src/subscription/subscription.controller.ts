import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  @ApiOperation({ summary: 'Create a new subscription (Customer only)' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — Guest users cannot subscribe' })
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() dto: RangeDTO) {
    return this.subscriptionService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  @ApiOperation({ summary: 'Update a subscription (Customer only)' })
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptionService.update(+id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  @ApiOperation({ summary: 'Cancel a subscription (Customer only)' })
  remove(@Param('id') id: string) {
    return this.subscriptionService.remove(+id);
  }

  // 🔹 Customer-specific routes
  @Get('customer/:customerId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  @ApiOperation({ summary: 'Get subscriptions for a customer (Customer only) with pagination' })
  @ApiResponse({ status: 403, description: 'Forbidden — Guest users cannot view personal subscriptions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getByCustomer(
    @Param('customerId') customerId: string,
    @Query() dto: RangeDTO,
    @Query('active') active?: string,
  ) {
    const onlyActive = active === 'true';
    return this.subscriptionService.findByCustomer(+customerId, onlyActive, dto);
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get subscriptions for a vendor with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getByVendor(
    @Param('vendorId') vendorId: string,
    @Query() dto: RangeDTO,
    @Query('active') active?: string,
  ) {
    const onlyActive = active === 'true';
    return this.subscriptionService.findByVendor(+vendorId, onlyActive, dto);
  }

  @Get('customer/:customerId/vendor/:vendorId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  @ApiOperation({ summary: 'Get subscriptions for a customer+vendor combo (Customer only) with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getByCustomerAndVendor(
    @Param('customerId') customerId: string,
    @Param('vendorId') vendorId: string,
    @Query() dto: RangeDTO,
    @Query('active') active?: string,
  ) {
    const onlyActive = active === 'true';
    return this.subscriptionService.findByCustomerAndVendor(
      +customerId,
      +vendorId,
      onlyActive,
      dto,
    );
  }
}
