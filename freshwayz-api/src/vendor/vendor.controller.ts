import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('vendors')
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  // @Post()
  // create(@Body() dto: CreateVendorDto) {
  //   return this.vendorService.create(dto);
  // }

  @Get()
  findAll() {
    return this.vendorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  update(@Param('id') id: string, @Body() dto: UpdateVendorDto, @Req() req: any) {
    const isVendor = req.user?.role?.toLowerCase() === 'vendor';
    if (isVendor && req.user?.profileId !== +id) {
      throw new ForbiddenException('You can only update your own vendor details');
    }
    if (isVendor) {
      delete (dto as any).userTypeId;
    }
    return this.vendorService.update(+id, dto);
  }

  @Patch(':id/profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  updateProfile(@Param('id') id: string, @Body() dto: UpdateVendorProfileDto, @Req() req: any) {
    const isVendor = req.user?.role?.toLowerCase() === 'vendor';
    if (isVendor && req.user?.profileId !== +id) {
      throw new ForbiddenException('You can only update your own vendor profile');
    }
    return this.vendorService.updateProfile(+id, dto);
  }

  @Get(':id/dashboard-stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  getDashboardStats(@Param('id') id: string, @Req() req: any) {
    const isVendor = req.user?.role?.toLowerCase() === 'vendor';
    if (isVendor && req.user?.profileId !== +id) {
      throw new ForbiddenException('You can only view your own dashboard stats');
    }
    return this.vendorService.getDashboardStats(+id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  remove(@Param('id') id: string) {
    return this.vendorService.remove(+id);
  }
}
