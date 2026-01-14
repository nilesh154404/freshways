import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrderReturnService } from './order-return.service';
import { CreateOrderReturnDto } from './dto/create-order-return.dto';
import { UpdateOrderReturnDto } from './dto/update-order-return.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('order-return')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class OrderReturnController {
  constructor(private readonly orderReturnService: OrderReturnService) {}

  @Post()
  create(@Body() createOrderReturnDto: CreateOrderReturnDto) {
    return this.orderReturnService.create(createOrderReturnDto);
  }

  @Get()
  findAll() {
    return this.orderReturnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderReturnService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderReturnDto: UpdateOrderReturnDto) {
    return this.orderReturnService.update(+id, updateOrderReturnDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderReturnService.remove(+id);
  }
}
