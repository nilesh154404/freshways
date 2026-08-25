import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

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
  @ApiOperation({ summary: 'Get all subscriptions' })
  findAll() {
    return this.subscriptionService.findAll();
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
  @ApiOperation({ summary: 'Get subscriptions for a customer (Customer only)' })
  @ApiResponse({ status: 403, description: 'Forbidden — Guest users cannot view personal subscriptions' })
  getByCustomer(
    @Param('customerId') customerId: string,
    @Query('active') active?: string,
  ) {
    const onlyActive = active === 'true';
    return this.subscriptionService.findByCustomer(+customerId, onlyActive);
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get subscriptions for a vendor' })
  getByVendor(
    @Param('vendorId') vendorId: string,
    @Query('active') active?: string,
  ) {
    const onlyActive = active === 'true';
    return this.subscriptionService.findByVendor(+vendorId, onlyActive);
  }

  @Get('customer/:customerId/vendor/:vendorId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  @ApiOperation({ summary: 'Get subscriptions for a customer+vendor combo (Customer only)' })
  getByCustomerAndVendor(
    @Param('customerId') customerId: string,
    @Param('vendorId') vendorId: string,
    @Query('active') active?: string,
  ) {
    const onlyActive = active === 'true';
    return this.subscriptionService.findByCustomerAndVendor(
      +customerId,
      +vendorId,
      onlyActive,
    );
  }
}
