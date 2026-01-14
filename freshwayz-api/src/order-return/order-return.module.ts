import { Module } from '@nestjs/common';
import { OrderReturnService } from './order-return.service';
import { OrderReturnController } from './order-return.controller';

@Module({
  controllers: [OrderReturnController],
  providers: [OrderReturnService],
})
export class OrderReturnModule {}
