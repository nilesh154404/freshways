import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DailyPriceService } from './daily-price.service';
import { DailyPriceController } from './daily-price.controller';

import { DailyPrice } from './entities/daily-price.entity';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyPrice, Product, Vendor]),
  ],
  controllers: [DailyPriceController],
  providers: [DailyPriceService],
})
export class DailyPriceModule {}
