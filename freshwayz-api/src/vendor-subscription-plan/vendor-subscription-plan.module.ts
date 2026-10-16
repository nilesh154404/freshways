import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorSubscriptionPlan } from './entities/vendor-subscription-plan.entity';
import { VendorSubscriptionPlanService } from './vendor-subscription-plan.service';
import { VendorSubscriptionPlanController } from './vendor-subscription-plan.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([VendorSubscriptionPlan]), AuthModule],
  controllers: [VendorSubscriptionPlanController],
  providers: [VendorSubscriptionPlanService],
  exports: [VendorSubscriptionPlanService],
})
export class VendorSubscriptionPlanModule {}
