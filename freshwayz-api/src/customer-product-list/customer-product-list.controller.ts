import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { CustomerProductListService } from './customer-product-list.service';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';

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

  // DELETE
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.service.deleteById(+id);
  }
}
