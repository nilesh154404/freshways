// delivery-slots.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateDeliverySlotDto } from './dto/create-delivery-slot.dto';
import { UpdateDeliverySlotDto } from './dto/update-delivery-slot.dto';
import { DeliverySlot } from './entities/delivery-slot.entity';
import { DeliverySlotsService } from './delivery-slot.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Delivery Slots')
@Controller('delivery-slots')
export class DeliverySlotsController {
  constructor(private readonly service: DeliverySlotsService) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  @ApiOperation({ summary: 'Create delivery slot' })
  @ApiResponse({ status: 201, type: DeliverySlot })
  create(@Body() dto: CreateDeliverySlotDto, @Req() req: any) {
    return this.service.create(dto, req.user);
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  @ApiOperation({ summary: 'Update delivery slot' })
  @ApiResponse({ status: 200, type: DeliverySlot })
  update(
    @Param('id') id: number,
    @Body() dto: UpdateDeliverySlotDto,
    @Req() req: any,
  ) {
    return this.service.update(+id, dto, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  @ApiOperation({ summary: 'Delete delivery slot' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: number, @Req() req: any) {
    return this.service.remove(+id, req.user);
  }
}
