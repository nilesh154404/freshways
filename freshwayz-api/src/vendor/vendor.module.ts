import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { Vendor } from './entities/vendor.entity';
import { UserType } from 'src/user-type/entities/user-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor, UserType])],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}