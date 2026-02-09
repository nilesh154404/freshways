import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { VendorProductsService } from './vendor-products.service';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';

@Controller('vendor-products')
export class VendorProductsController {
  constructor(
    private readonly vendorProductsService: VendorProductsService,
    private readonly jwtService: JwtService
  ) {}

  @Post()
  create(@Body() createVendorProductDto: CreateVendorProductDto) {
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
  update(@Param('id') id: string, @Body() updateVendorProductDto: UpdateVendorProductDto) {
    return this.vendorProductsService.update(+id, updateVendorProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    // Extract JWT from Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new ForbiddenException('No token provided');
    const token = authHeader.replace('Bearer ', '');
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (e) {
      throw new ForbiddenException('Invalid token');
    }
    if (payload.role !== 'Vendor' || !payload.profileId) {
      throw new ForbiddenException('Only vendors can delete their products');
    }
    // Only allow deletion if vendor owns the product
    return this.vendorProductsService.remove(+id, payload.profileId);
  }
}
