import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorProductsService } from './vendor-products.service';
import { VendorProductsController } from './vendor-products.controller';
import { Product } from 'src/products/entities/product.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [VendorProductsController],
  providers: [VendorProductsService, JwtService],
})
export class VendorProductsModule {}
