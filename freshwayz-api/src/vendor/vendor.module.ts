import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { Vendor } from './entities/vendor.entity';
import { UserType } from 'src/user-type/entities/user-type.entity';
import { Categories } from 'src/categories/categories.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor, UserType, Categories, Order, Product])],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}