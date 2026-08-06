import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { VendorSubscriptionPlan } from 'src/vendor-subscription-plan/entities/vendor-subscription-plan.entity';
import { Categories } from 'src/categories/categories.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';

import { ProductCustomizationGroup } from './entities/product-customization-group.entity';
import { ProductCustomizationOption } from './entities/product-customization-option.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ServiceOffering,
      VendorSubscriptionPlan,
      Categories,
      Vendor,
      ProductCustomizationGroup,
      ProductCustomizationOption
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule { }
