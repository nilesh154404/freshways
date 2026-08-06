import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomerProduct } from './entities/customer-product.entity';
import { CustomerProductListService } from './customer-product-list.service';
import { CustomerProductListController } from './customer-product-list.controller';

import { Customer } from '../customer/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { VendorSubscriptionPlan } from '../vendor-subscription-plan/entities/vendor-subscription-plan.entity';
import { ProductCustomizationOption } from '../products/entities/product-customization-option.entity';
import { ProductCustomizationGroup } from '../products/entities/product-customization-group.entity';
import { DailyPrice } from '../daily-price/entities/daily-price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerProduct,
      Customer,
      Product,
      VendorSubscriptionPlan,
      ProductCustomizationOption,
      ProductCustomizationGroup,
      DailyPrice
    ]),
  ],
  controllers: [CustomerProductListController],
  providers: [CustomerProductListService],
})
export class CustomerProductListModule {}
