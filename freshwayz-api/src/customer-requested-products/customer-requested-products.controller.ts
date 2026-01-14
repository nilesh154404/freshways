import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomerRequestedProductsService } from './customer-requested-products.service';
import { CreateCustomerRequestedProductDto } from './dto/create-customer-requested-product.dto';
import { UpdateCustomerRequestedProductDto } from './dto/update-customer-requested-product.dto';

@Controller('customer-requested-products')
export class CustomerRequestedProductsController {
  constructor(private readonly customerRequestedProductsService: CustomerRequestedProductsService) {}

  @Post()
  create(@Body() createCustomerRequestedProductDto: CreateCustomerRequestedProductDto) {
    return this.customerRequestedProductsService.create(createCustomerRequestedProductDto);
  }

  @Get()
  findAll() {
    return this.customerRequestedProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerRequestedProductsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerRequestedProductDto: UpdateCustomerRequestedProductDto) {
    return this.customerRequestedProductsService.update(+id, updateCustomerRequestedProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerRequestedProductsService.remove(+id);
  }
}
