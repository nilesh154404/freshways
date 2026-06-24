import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderReturnService } from './order-return.service';
import { OrderReturnController } from './order-return.controller';
import { OrderReturn } from './entities/order-return.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderReturn, Customer, Order, Product])],
  controllers: [OrderReturnController],
  providers: [OrderReturnService],
})
export class OrderReturnModule {}
