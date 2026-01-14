import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListedOrder } from './entities/listed-order.entity';
import { ListedOrderService } from './listed-order.service';
import { ListedOrderController } from './listed-order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ListedOrder])],
  controllers: [ListedOrderController],
  providers: [ListedOrderService],
  exports: [ListedOrderService],
})
export class ListedOrderModule {}
