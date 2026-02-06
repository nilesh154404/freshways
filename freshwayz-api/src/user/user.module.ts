import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { UserType } from 'src/user-type/entities/user-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Vendor,
      Customer,
      Product,
      Order,
      UserType,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // optional but good practice
})
export class UserModule {}
