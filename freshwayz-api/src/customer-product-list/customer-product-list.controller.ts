import { Controller, Post, Body, Get, Param, Delete, Patch, ParseIntPipe, Query } from '@nestjs/common';
import { CustomerProductListService } from './customer-product-list.service';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { UpdateCustomerProductDto } from './dto/update-customer-product.dto';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

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
  getByCustomer(@Param('customerId') customerId: number, @Query() dto: RangeDTO) {
    return this.service.getByCustomerId(+customerId, dto);
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
