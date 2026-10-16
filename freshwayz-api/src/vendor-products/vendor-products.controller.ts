import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VendorProductsService } from './vendor-products.service';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('vendor-products')
@Controller('vendor-products')
export class VendorProductsController {
  constructor(
    private readonly vendorProductsService: VendorProductsService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  create(@Body() createVendorProductDto: CreateVendorProductDto, @Req() req: any) {
    return this.vendorProductsService.create(createVendorProductDto);
  }

  @Get()
  findAll() {
    return this.vendorProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorProductsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  update(@Param('id') id: string, @Body() updateVendorProductDto: UpdateVendorProductDto, @Req() req: any) {
    return this.vendorProductsService.update(+id, updateVendorProductDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.vendorProductsService.remove(+id, req.user?.profileId, req.user?.role);
  }
}
