import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorSubscriptionPlan } from './entities/vendor-subscription-plan.entity';
import { VendorSubscriptionPlanService } from './vendor-subscription-plan.service';
import { VendorSubscriptionPlanController } from './vendor-subscription-plan.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VendorSubscriptionPlan])],
  controllers: [VendorSubscriptionPlanController],
  providers: [VendorSubscriptionPlanService],
  exports: [VendorSubscriptionPlanService],
})
export class VendorSubscriptionPlanModule {}
