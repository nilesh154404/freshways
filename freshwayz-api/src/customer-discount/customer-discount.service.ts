import { Injectable } from '@nestjs/common';
import { CreateCustomerDiscountDto } from './dto/create-customer-discount.dto';
import { UpdateCustomerDiscountDto } from './dto/update-customer-discount.dto';

@Injectable()
export class CustomerDiscountService {
  create(createCustomerDiscountDto: CreateCustomerDiscountDto) {
    return 'This action adds a new customerDiscount';
  }

  findAll() {
    return `This action returns all customerDiscount`;
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
