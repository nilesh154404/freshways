import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CustomerDiscountService } from './customer-discount.service';
import { CreateCustomerDiscountDto } from './dto/create-customer-discount.dto';
import { UpdateCustomerDiscountDto } from './dto/update-customer-discount.dto';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@ApiTags('Customer Discount')
@Controller('customer-discount')
export class CustomerDiscountController {
  constructor(private readonly customerDiscountService: CustomerDiscountService) {}

  @Post()
  create(@Body() createCustomerDiscountDto: CreateCustomerDiscountDto) {
    return this.customerDiscountService.create(createCustomerDiscountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customer discounts with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() dto: RangeDTO) {
    return this.customerDiscountService.findAll(dto);
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
