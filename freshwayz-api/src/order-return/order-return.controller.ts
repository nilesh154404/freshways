import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { OrderReturnService } from './order-return.service';
import { CreateOrderReturnDto } from './dto/create-order-return.dto';
import { UpdateOrderReturnDto } from './dto/update-order-return.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('order-return')
@Controller('order-return')
@ApiBearerAuth()
export class OrderReturnController {
  constructor(private readonly orderReturnService: OrderReturnService) { }

  @Post()
  @ApiOperation({ summary: 'Create refund and cancellation request' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  create(@Body() createOrderReturnDto: CreateOrderReturnDto) {
    return this.orderReturnService.create(createOrderReturnDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Find all cancellation requests' })
  findAll() {
    return this.orderReturnService.findAll();
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Find all requests for a specific customer' })
  findByCustomerId(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.orderReturnService.findByCustomerId(customerId);
  }

  @Get('vendor/:vendorId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Find all requests for a specific vendor' })
  findByVendorId(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return this.orderReturnService.findByVendorId(vendorId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Find a specific request by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderReturnService.findOne(id);
  }

  @Patch(':id/confirm-cancel')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Confirm / Approve cancellation request' })
  confirmCancel(@Param('id', ParseIntPipe) id: number) {
    return this.orderReturnService.confirmCancel(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update a specific request by ID' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateOrderReturnDto: UpdateOrderReturnDto) {
    return this.orderReturnService.update(id, updateOrderReturnDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete a specific request by ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderReturnService.remove(id);
  }
}
