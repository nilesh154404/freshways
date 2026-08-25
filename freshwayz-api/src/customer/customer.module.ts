import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserType } from 'src/user-type/entities/user-type.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, UserType]),
    AuthModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule { }
