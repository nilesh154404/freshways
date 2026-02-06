import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DailyPriceService } from './daily-price.service';
import { DailyPriceController } from './daily-price.controller';

import { DailyPrice } from './entities/daily-price.entity';
import { PriceLog } from './entities/price-log.entity';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyPrice, PriceLog, Product, Vendor]),
  ],
  controllers: [DailyPriceController],
  providers: [DailyPriceService],
})
export class DailyPriceModule {}
