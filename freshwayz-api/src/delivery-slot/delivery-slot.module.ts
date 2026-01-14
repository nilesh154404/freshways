// delivery-slots.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliverySlot } from './entities/delivery-slot.entity';
import { DeliverySlotsController } from './delivery-slot.controller';
import { DeliverySlotsService } from './delivery-slot.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeliverySlot])],
  controllers: [DeliverySlotsController],
  providers: [DeliverySlotsService],
})
export class DeliverySlotsModule {}
