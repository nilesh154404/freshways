import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListedOrder } from './entities/listed-order.entity';
import { ListedOrderService } from './listed-order.service';
import { ListedOrderController } from './listed-order.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ListedOrder]), AuthModule],
  controllers: [ListedOrderController],
  providers: [ListedOrderService],
  exports: [ListedOrderService],
})
export class ListedOrderModule {}
