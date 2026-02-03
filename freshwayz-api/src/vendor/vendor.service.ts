import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
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

  async getVendorsCount() {
    const total = await this.vendorRepo.count();

    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const newThisMonth = await this.vendorRepo.count({
      where: {
        createdAt: MoreThanOrEqual(firstDayCurrentMonth),
      }
    });

    const newLastMonth = await this.vendorRepo.count({
      where: {
        createdAt: Between(firstDayLastMonth, lastDayLastMonth),
      }
    });

    let growth = 0;
    if (newLastMonth > 0) {
      growth = ((newThisMonth - newLastMonth) / newLastMonth) * 100;
    } else if (newThisMonth > 0) {
      growth = 100;
    }

    return { total, growth: Math.round(growth), newThisMonth };
  }


  async findOne(id: number) {
    const vendor = await this.vendorRepo.findOne({
      where: { id },
      relations: ['userType', 'products', 'categories', 'vendorSubscriptionPlan'],
    });

    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async update(id: number, updateData: UpdateVendorDto) {
    const vendor = await this.findOne(id);
    const { categories, ...rest } = updateData;

    Object.assign(vendor, rest);

    if (updateData.userTypeId) {
      const userType = await this.userTypeRepo.findOne({ where: { id: updateData.userTypeId } });
      if (!userType) throw new NotFoundException('User Type not found');

      vendor.userType = userType;
    }

    if (categories) {
      vendor.categories = categories.map(id => ({ id } as any));
    }

    return this.vendorRepo.save(vendor);
  }

  async remove(id: number) {
    const vendor = await this.findOne(id);
    await this.vendorRepo.remove(vendor);
    return { message: 'Vendor removed successfully' };
  }
}
