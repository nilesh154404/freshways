import { Injectable } from '@nestjs/common';
import { CreateCustomerRequestedProductDto } from './dto/create-customer-requested-product.dto';
import { UpdateCustomerRequestedProductDto } from './dto/update-customer-requested-product.dto';

@Injectable()
export class CustomerRequestedProductsService {
  create(createCustomerRequestedProductDto: CreateCustomerRequestedProductDto) {
    return 'This action adds a new customerRequestedProduct';
  }

  findAll() {
    return `This action returns all customerRequestedProducts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customerRequestedProduct`;
  }

  update(id: number, updateCustomerRequestedProductDto: UpdateCustomerRequestedProductDto) {
    return `This action updates a #${id} customerRequestedProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} customerRequestedProduct`;
  }
}
