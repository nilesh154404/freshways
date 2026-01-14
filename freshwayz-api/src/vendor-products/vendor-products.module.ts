import { Module } from '@nestjs/common';
import { VendorProductsService } from './vendor-products.service';
import { VendorProductsController } from './vendor-products.controller';

@Module({
  controllers: [VendorProductsController],
  providers: [VendorProductsService],
})
export class VendorProductsModule {}
