import { Module } from '@nestjs/common';
import { ProductDiscountService } from './product-discount.service';
import { ProductDiscountController } from './product-discount.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductDiscount } from './entities/product-discount.entity';
import { Product } from 'src/products/entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductDiscount]), AuthModule],
  controllers: [ProductDiscountController],
  providers: [ProductDiscountService],
  exports: [ProductDiscountService], // 👈 REQUIRED

})
export class ProductDiscountModule { }
