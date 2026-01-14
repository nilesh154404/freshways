import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.create(dto);
  }

  @Get()
  findAll() {
    return this.subscriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptionService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionService.remove(+id);
  }

  // 🔹 New routes
  @Get('customer/:customerId')
  getByCustomer(
    @Param('customerId') customerId: string,
    @Query('active') active?: string,
  ) {
    const onlyActive = active === 'true';
    return this.subscriptionService.findByCustomer(+customerId, onlyActive);
  }

  @Get('vendor/:vendorId')
  getByVendor(
    @Param('vendorId') vendorId: string,
    @Query('active') active?: string,
  ) {
    const onlyActive = active === 'true';
    return this.subscriptionService.findByVendor(+vendorId, onlyActive);
  }

  @Get('customer/:customerId/vendor/:vendorId')
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
