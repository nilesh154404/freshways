import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UserType } from 'src/user-type/entities/user-type.entity';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(UserType) private readonly userTypeRepo: Repository<UserType>,
  ) { }

  // async create(data: CreateVendorDto) {
  //   const userType = await this.userTypeRepo.findOne({ where: { id: data.userTypeId } });
  //   if (!userType) throw new NotFoundException('User Type not found');

  //   const vendor = this.vendorRepo.create({
  //     businessName: data.businessName,
  //     email: data.email,
  //     gstNumber: data.gstNumber,
  //     address: data.address,
  //     ownerName: data.ownerName,
  //     userType,
  //   });

  //   return this.vendorRepo.save(vendor);
  // }

  async findAll() {
    return this.vendorRepo.find({
      relations: ['userType', 'orders', 'dailyPrice', 'vendorSubscriptionPlan'],
    });
  }

  async findOne(id: number) {
    const vendor = await this.vendorRepo.findOne({
      where: { id },
      relations: ['userType', 'products',
        //'orders',
        // 'dailyPrice',
        'vendorSubscriptionPlan'],
    });

    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async update(id: number, updateData: UpdateVendorDto) {
    const vendor = await this.findOne(id);

    Object.assign(vendor, updateData);

    if (updateData.userTypeId) {
      const userType = await this.userTypeRepo.findOne({ where: { id: updateData.userTypeId } });
      if (!userType) throw new NotFoundException('User Type not found');

      vendor.userType = userType;
    }

    return this.vendorRepo.save(vendor);
  }

  async remove(id: number) {
    const vendor = await this.findOne(id);
    await this.vendorRepo.remove(vendor);
    return { message: 'Vendor removed successfully' };
  }
}
