import { Injectable } from '@nestjs/common';
import { CreateCustomerDiscountDto } from './dto/create-customer-discount.dto';
import { UpdateCustomerDiscountDto } from './dto/update-customer-discount.dto';
import { paginateArray, PaginatedResponse } from 'src/helpers/pagination/pagination';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@Injectable()
export class CustomerDiscountService {
  create(createCustomerDiscountDto: CreateCustomerDiscountDto) {
    return 'This action adds a new customerDiscount';
  }

  findAll(dto?: RangeDTO): PaginatedResponse<any> {
    return paginateArray([], dto);
  }

  findOne(id: number) {
    return `This action returns a #${id} customerDiscount`;
  }

  update(id: number, updateCustomerDiscountDto: UpdateCustomerDiscountDto) {
    return `This action updates a #${id} customerDiscount`;
  }

  remove(id: number) {
    return `This action removes a #${id} customerDiscount`;
  }
}
