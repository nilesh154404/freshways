import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomerProduct } from './entities/customer-product.entity';
import { CustomerProductListService } from './customer-product-list.service';
import { CustomerProductListController } from './customer-product-list.controller';

import { User } from '../user/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { VendorSubscriptionPlan } from '../vendor-subscription-plan/entities/vendor-subscription-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerProduct,
      User,
      Product,
      VendorSubscriptionPlan,
    ]),
  ],
  controllers: [CustomerProductListController],
  providers: [CustomerProductListService],
})
export class CustomerProductListModule {}
