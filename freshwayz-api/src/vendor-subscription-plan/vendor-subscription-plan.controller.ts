import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { VendorSubscriptionPlanService } from './vendor-subscription-plan.service';
import { CreateVendorSubscriptionPlanDto } from './dto/create-vendor-subscription-plan.dto';
import { UpdateVendorSubscriptionPlanDto } from './dto/update-vendor-subscription-plan.dto';

@ApiTags('Vendor Subscription Plans')
@Controller('vendor-subscription-plans')
export class VendorSubscriptionPlanController {
  constructor(private readonly service: VendorSubscriptionPlanService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Created successfully' })
  create(@Body() dto: CreateVendorSubscriptionPlanDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: 'List of plans' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Plan details' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVendorSubscriptionPlanDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // ⭐ EXTRA ENDPOINT — Get plan by vendor
  @Get('vendor/:vendorId')
  @ApiOkResponse({ description: 'Get plan of a vendor by vendorId' })
  getPlanByVendor(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return this.service.findByVendor(vendorId);
  }
}
