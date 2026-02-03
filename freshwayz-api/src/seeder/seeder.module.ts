import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederController } from './seeder.controller';
import { Vendor } from '../vendor/entities/vendor.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customer/entities/customer.entity';
import { UserType } from '../user-type/entities/user-type.entity';
import { User } from '../user/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Vendor, Product, Customer, UserType, User]),
    ],
    controllers: [SeederController],
})
export class SeederModule { }
