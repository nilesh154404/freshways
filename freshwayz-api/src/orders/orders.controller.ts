import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { CreateNewOrderDto } from './dto/create-new-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PlaceOrderFromProductListDto } from './dto/place-order-from-product-list.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

function extractUserFromRequest(req: any): any {
  if (req?.user) return req.user;
  const authHeader = req?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const parts = authHeader.split(' ')[1].split('.');
      if (parts.length === 3) {
        return JSON.parse(Buffer.from(parts[1], 'base64').toString());
      }
    } catch {}
  }
  return null;
}

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post('place-from-product-list')
  @ApiOperation({ summary: 'Create order from customer product list' })
  @ApiResponse({ status: 201, description: 'Order created from product list' })
  placeOrderFromProductList(
    @Body() dto: PlaceOrderFromProductListDto,
    @Req() req: any,
  ) {
    const user = extractUserFromRequest(req);
    if (user?.role?.toLowerCase() === 'guest') {
      throw new ForbiddenException('Guest users cannot place orders. Please log in with a registered account.');
    }
    return this.orderService.placeOrderFromProductList(dto, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order with listed items' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  createNew(
    @Body() createDto: CreateNewOrderDto,
    @Req() req: any,
  ) {
    const user = extractUserFromRequest(req);
    if (user?.role?.toLowerCase() === 'guest') {
      throw new ForbiddenException('Guest users cannot place orders. Please log in with a registered account.');
    }
    return this.orderService.createNew(createDto, user);
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
    @Param('customerId', ParseIntPipe) customerId: number,
    @Req() req: any,
  ) {
    const user = extractUserFromRequest(req);
    if (user?.role?.toLowerCase() === 'customer' && user?.profileId !== customerId) {
      throw new ForbiddenException('You can only view your own orders');
    }
    return this.orderService.findByCustomerId(customerId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, type: Order })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

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
    return this.orderService.findOneByVendorServicePlan(id, customerId);
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

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get orders by vendor ID' })
  getOrdersByVendor(@Param('vendorId') vendorId: string) {
    return this.orderService.getOrdersByVendor(+vendorId);
  }

  @Get('pending-by-product/:productId')
  @ApiOperation({ summary: 'Get all pending/active orders for a specific product' })
  async getPendingByProductId(@Param('productId', ParseIntPipe) productId: number) {
    return this.orderService.findPendingByProductId(productId);
  }
}
