import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { Categories } from 'src/categories/categories.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { VendorDashboardStatsDto } from './dto/vendor-dashboard-stats.dto';
import { UserType } from 'src/user-type/entities/user-type.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Categories) private readonly categoriesRepo: Repository<Categories>,
    @InjectRepository(UserType) private readonly userTypeRepo: Repository<UserType>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
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
      relations: ['userType', 'orders', 'dailyPrice', 'vendorSubscriptionPlan', 'categories'],
    });
  }

  async findOne(id: number) {
    const vendor = await this.vendorRepo.findOne({
      where: { id },
      relations: ['userType', 'products',
        //'orders',
        // 'dailyPrice',
        'vendorSubscriptionPlan', 'categories'],
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

  async updateProfile(id: number, updateData: UpdateVendorProfileDto) {
    const vendor = await this.findOne(id);

    if (updateData.ownerName !== undefined) {
      vendor.ownerName = updateData.ownerName;
    }

    if (updateData.address !== undefined) {
      vendor.address = updateData.address;
    }

    if (updateData.website !== undefined) {
      vendor.website = updateData.website;
    }

    if (updateData.categories) {
      const categories = await this.categoriesRepo.findBy({ id: In(updateData.categories) });
      vendor.categories = categories;
    }

    return this.vendorRepo.save(vendor);
  }

  async remove(id: number) {
    const vendor = await this.findOne(id);
    await this.vendorRepo.remove(vendor);
    return { message: 'Vendor removed successfully' };
  }

  async getDashboardStats(vendorId: number): Promise<VendorDashboardStatsDto> {
    // Get vendor products count
    const totalProducts = await this.productRepo.count({ where: { vendor: { id: vendorId } } });
    
    // Get active products (assuming there's an isActive or similar field)
    const activeProducts = await this.productRepo.count({ 
      where: { vendor: { id: vendorId } } 
    });

    // Get total orders
    const totalOrders = await this.orderRepo.count({ where: { vendor: { id: vendorId } } });

    // Get total revenue
    const orders = await this.orderRepo.find({ 
      where: { vendor: { id: vendorId } },
      select: ['grandTotal']
    });
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.grandTotal) || 0), 0);

    // Get weekly revenue (last 7 days)
    const weeklyRevenue = await this.getWeeklyRevenue(vendorId);

    // Get weekly orders (last 7 days)
    const weeklyOrders = await this.getWeeklyOrders(vendorId);

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      totalRevenue,
      weeklyRevenue,
      weeklyOrders,
    };
  }

  private async getWeeklyRevenue(vendorId: number): Promise<{ name: string; revenue: number }[]> {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weeklyData: { name: string; revenue: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const orders = await this.orderRepo
        .createQueryBuilder('order')
        .where('order.vendorId = :vendorId', { vendorId })
        .andWhere('order.createdAt >= :startOfDay', { startOfDay })
        .andWhere('order.createdAt <= :endOfDay', { endOfDay })
        .getMany();

      const revenue = orders.reduce((sum, order) => sum + (Number(order.grandTotal) || 0), 0);
      
      weeklyData.push({
        name: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        revenue: Math.round(revenue),
      });
    }

    return weeklyData;
  }

  private async getWeeklyOrders(vendorId: number): Promise<{ name: string; orders: number }[]> {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weeklyData: { name: string; orders: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const orders = await this.orderRepo
        .createQueryBuilder('order')
        .where('order.vendorId = :vendorId', { vendorId })
        .andWhere('order.createdAt >= :startOfDay', { startOfDay })
        .andWhere('order.createdAt <= :endOfDay', { endOfDay })
        .getCount();
      
      weeklyData.push({
        name: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        orders,
      });
    }

    return weeklyData;
  }
}
