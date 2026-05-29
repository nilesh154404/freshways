import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserType } from 'src/user-type/entities/user-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, UserType])],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule { }
