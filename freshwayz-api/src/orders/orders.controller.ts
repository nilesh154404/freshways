import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { CreateNewOrderDto } from './dto/create-new-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post('place-from-product-list')
  @ApiOperation({ summary: 'Create order from customer product list' })
  @ApiResponse({ status: 201, description: 'Order created from product list' })
  placeOrderFromProductList(@Body() dto: { customerId: number; communityId: number; vendorSubscriptionPlanId: number }) {
    return this.orderService.placeOrderFromProductList(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order with listed items' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  createNew(@Body() createDto: CreateNewOrderDto) {
    return this.orderService.createNew(createDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.orderService.updateStatus(id, dto);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get all orders for a specific customer' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No orders found for this customer' })
  getOrdersByCustomerId(
    @Param('customerId', ParseIntPipe) customerId: number
  ) {
    return this.orderService.findByCustomerId(customerId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, type: Order })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  // @Get()
  // @ApiOperation({ summary: 'Get all orders' })
  // @ApiResponse({ status: 200, type: [Order] })
  // findAll() {
  //   return this.orderService.findAll();
  // }
  @Get()
  @ApiOperation({ summary: 'Get all orders with optional filters' })
  @ApiResponse({ status: 200, type: [Order] })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'vendorId', required: false })
  @ApiQuery({ name: 'communityId', required: false })
  @ApiQuery({ name: 'orderStatus', required: false })
  @ApiQuery({ name: 'paymentStatus', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'deliveryDate', required: false })
  async findAll(
    @Query('customerId') customerId?: number,
    @Query('vendorId') vendorId?: number,
    @Query('communityId') communityId?: number,
    @Query('orderStatus') orderStatus?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('deliveryDate') deliveryDate?: string,
  ) {
    return this.orderService.findAll({
      customerId,
      vendorId,
      communityId,
      orderStatus,
      paymentStatus,
      startDate,
      endDate,
      deliveryDate,
    });
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, type: Order })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Get('vendor-service-plan/:id')
  @ApiOperation({ summary: 'Get order by vendor service plan ID' })
  @ApiResponse({ status: 200, type: Order })
  findOneByVendorServicePlan(
    @Param('id', ParseIntPipe) id: number,
    @Query('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.orderService.findOneByVendorServicePlan(id,customerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order by ID' })
  @ApiResponse({ status: 200, type: Order })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete order by ID' })
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get orders by customer ID' })
  getOrdersByCustomer(@Param('customerId') customerId: string) {
    return this.orderService.getOrdersByCustomer(+customerId);
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get orders by vendor ID' })
  getOrdersByVendor(@Param('vendorId') vendorId: string) {
    return this.orderService.getOrdersByVendor(+vendorId);
  }
}
