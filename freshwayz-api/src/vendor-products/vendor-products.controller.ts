import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VendorProductsService } from './vendor-products.service';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';

@Controller('vendor-products')
export class VendorProductsController {
  constructor(private readonly vendorProductsService: VendorProductsService) {}

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
  remove(@Param('id') id: string) {
    return this.vendorProductsService.remove(+id);
  }
}
