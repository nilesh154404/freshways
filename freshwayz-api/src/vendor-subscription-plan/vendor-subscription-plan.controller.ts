import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VendorSubscriptionPlanService } from './vendor-subscription-plan.service';
import { CreateVendorSubscriptionPlanDto } from './dto/create-vendor-subscription-plan.dto';
import { UpdateVendorSubscriptionPlanDto } from './dto/update-vendor-subscription-plan.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Vendor Subscription Plans')
@Controller('vendor-subscription-plans')
export class VendorSubscriptionPlanController {
  constructor(private readonly service: VendorSubscriptionPlanService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  @ApiCreatedResponse({ description: 'Created successfully' })
  create(@Body() dto: CreateVendorSubscriptionPlanDto, @Req() req: any) {
    return this.service.create(dto, req.user);
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  @ApiOkResponse({ description: 'Updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVendorSubscriptionPlanDto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  @ApiOkResponse({ description: 'Deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.remove(id, req.user);
  }

  // ⭐ EXTRA ENDPOINT — Get plan by vendor
  @Get('vendor/:vendorId')
  @ApiOkResponse({ description: 'Get plan of a vendor by vendorId' })
  getPlanByVendor(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return this.service.findByVendor(vendorId);
  }
}
