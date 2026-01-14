import { Module } from '@nestjs/common';
import { CustomerRequestedProductsService } from './customer-requested-products.service';
import { CustomerRequestedProductsController } from './customer-requested-products.controller';

@Module({
  controllers: [CustomerRequestedProductsController],
  providers: [CustomerRequestedProductsService],
})
export class CustomerRequestedProductsModule {}
