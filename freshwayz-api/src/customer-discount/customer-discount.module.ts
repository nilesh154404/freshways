import { Module } from '@nestjs/common';
import { CustomerDiscountService } from './customer-discount.service';
import { CustomerDiscountController } from './customer-discount.controller';

@Module({
  controllers: [CustomerDiscountController],
  providers: [CustomerDiscountService],
})
export class CustomerDiscountModule {}
