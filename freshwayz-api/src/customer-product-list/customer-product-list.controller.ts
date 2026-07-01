import { Controller, Post, Body, Get, Param, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { CustomerProductListService } from './customer-product-list.service';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { UpdateCustomerProductDto } from './dto/update-customer-product.dto';

@Controller('customer-product-list')
export class CustomerProductListController {
  constructor(private readonly service: CustomerProductListService) {}

  // CREATE
  @Post()
  async create(@Body() dto: CreateCustomerProductDto) {
    return this.service.create(dto);
  }

  // GET BY CUSTOMER
  @Get('customer/:customerId')
  getByCustomer(@Param('customerId') customerId: number) {
    return this.service.getByCustomerId(+customerId);
  }

  // UPDATE
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCustomerProductDto) {
    return this.service.update(id, dto);
  }

  // DELETE
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.service.deleteById(+id);
  }
}
