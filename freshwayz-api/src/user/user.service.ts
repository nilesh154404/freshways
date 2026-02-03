import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminDashboardStatsDto } from './dto/admin-dashboard-stats.dto';
import { User } from './entities/user.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getAdminDashboardStats(): Promise<AdminDashboardStatsDto> {
    // Get total products count
    const totalProducts = await this.productRepo.count();

    // Get total vendors count
    const totalVendors = await this.vendorRepo.count();

    // Get active users/customers count
    const activeUsers = await this.customerRepo.count();

    // Get total subscriptions (you can adjust this based on your subscription logic)
    const totalSubscriptions = 0; // Placeholder - implement based on your subscription entity

    // Get weekly revenue (last 7 days)
    const weeklyRevenue = await this.getWeeklyRevenue();

    // Get weekly orders (last 7 days)
    const weeklyOrders = await this.getWeeklyOrders();

    return {
      totalProducts,
      totalVendors,
      activeUsers,
      totalSubscriptions,
      weeklyRevenue,
      weeklyOrders,
    };
  }

  private async getWeeklyRevenue(): Promise<{ name: string; revenue: number }[]> {
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
        .where('order.createdAt >= :startOfDay', { startOfDay })
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

  private async getWeeklyOrders(): Promise<{ name: string; orders: number }[]> {
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
        .where('order.createdAt >= :startOfDay', { startOfDay })
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
