import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { UserType } from 'src/user-type/entities/user-type.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Repository } from 'typeorm';
import { AdminDashboardStatsDto } from './dto/admin-dashboard-stats.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserType)
    private readonly userTypeRepository: Repository<UserType>,
  ) {}
  async create(dto: CreateUserDto): Promise<User> {
    // 1️⃣ Check email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 2️⃣ Find UserType
    const userType = await this.userTypeRepository.findOne({
      where: { id: dto.userType.id },
    });

    if (!userType) {
      throw new NotFoundException('UserType not found');
    }

    // 3️⃣ Create user entity
    const user = this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      userType: userType,
    });

    // 4️⃣ Save user
    return await this.userRepository.save(user);
  }

  // Optional: find all users with relations
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['userType', 'auth'],
    });
  }

  // Optional: find single user
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userType', 'auth'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userType'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.email) user.email = dto.email;
    if (dto.phone) user.phone = dto.phone;

    if (dto.userType?.id) {
      const userType = await this.userTypeRepository.findOne({
        where: { id: dto.userType.id },
      });

      if (!userType) {
        throw new NotFoundException('UserType not found');
      }

      user.userType = userType;
    }

    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);

    return { message: 'User deleted successfully' };
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

  private async getWeeklyRevenue(): Promise<
    { name: string; revenue: number }[]
  > {
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

      const revenue = orders.reduce(
        (sum, order) => sum + (Number(order.grandTotal) || 0),
        0,
      );

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
