import { Injectable } from '@nestjs/common';
import { CreateOrderReturnDto } from './dto/create-order-return.dto';
import { UpdateOrderReturnDto } from './dto/update-order-return.dto';

@Injectable()
export class OrderReturnService {
  create(createOrderReturnDto: CreateOrderReturnDto) {
    return 'This action adds a new orderReturn';
  }

  findAll() {
    return `This action returns all orderReturn`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orderReturn`;
  }

  update(id: number, updateOrderReturnDto: UpdateOrderReturnDto) {
    return `This action updates a #${id} orderReturn`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderReturn`;
  }
}
