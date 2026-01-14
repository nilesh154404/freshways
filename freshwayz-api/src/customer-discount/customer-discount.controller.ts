import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomerDiscountService } from './customer-discount.service';
import { CreateCustomerDiscountDto } from './dto/create-customer-discount.dto';
import { UpdateCustomerDiscountDto } from './dto/update-customer-discount.dto';

@Controller('customer-discount')
export class CustomerDiscountController {
  constructor(private readonly customerDiscountService: CustomerDiscountService) {}

  @Post()
  create(@Body() createCustomerDiscountDto: CreateCustomerDiscountDto) {
    return this.customerDiscountService.create(createCustomerDiscountDto);
  }

  @Get()
  findAll() {
    return this.customerDiscountService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerDiscountService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDiscountDto: UpdateCustomerDiscountDto) {
    return this.customerDiscountService.update(+id, updateCustomerDiscountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerDiscountService.remove(+id);
  }
}
