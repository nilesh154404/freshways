// delivery-slots.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateDeliverySlotDto } from './dto/create-delivery-slot.dto';
import { UpdateDeliverySlotDto } from './dto/update-delivery-slot.dto';
import { DeliverySlot } from './entities/delivery-slot.entity';
import { DeliverySlotsService } from './delivery-slot.service';

@ApiTags('Delivery Slots')
@Controller('delivery-slots')
export class DeliverySlotsController {
  constructor(private readonly service: DeliverySlotsService) { }

  @Post()
  @ApiOperation({ summary: 'Create delivery slot' })
  @ApiResponse({ status: 201, type: DeliverySlot })
  create(@Body() dto: CreateDeliverySlotDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all delivery slots' })
  @ApiResponse({ status: 200, type: [DeliverySlot] })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery slot by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: DeliverySlot })
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Get('vendor-subscription-plan/:id')
  @ApiOperation({ summary: 'Get delivery slot by VendorSubscriptionPlanId' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: DeliverySlot })
  findOneByVendorSubscriptionPlanId(@Param('id') id: number) {
    return this.service.findOneByVendorSubscriptionPlanId(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update delivery slot' })
  @ApiResponse({ status: 200, type: DeliverySlot })
  update(
    @Param('id') id: number,
    @Body() dto: UpdateDeliverySlotDto,
  ) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete delivery slot' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
