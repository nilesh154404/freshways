import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
import { Auth } from 'src/auth/entities/auth.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Auth) private readonly authRepo: Repository<Auth>,
  ) {}

  async forgotPassword(dto: ForgotPasswordDto) {
    const { username } = dto;

    // 1. Find the Auth record with profile relations matching username/phone or email
    const auth = await this.authRepo.createQueryBuilder('auth')
      .leftJoinAndSelect('auth.user', 'user')
      .leftJoinAndSelect('auth.vendor', 'vendor')
      .leftJoinAndSelect('auth.customer', 'customer')
      .where('auth.username = :input', { input: username })
      .orWhere('user.email = :input', { input: username })
      .orWhere('vendor.email = :input', { input: username })
      .orWhere('customer.email = :input', { input: username })
      .getOne();

    if (!auth) {
      throw new NotFoundException(`User account with username or email "${username}" not found`);
    }

    // 2. Identify email address and profile name based on linked entity
    let email = '';
    let targetName = 'User';

    if (auth.customer) {
      email = auth.customer.email;
      targetName = auth.customer.fullName || 'Customer';
    } else if (auth.vendor) {
      email = auth.vendor.email;
      targetName = auth.vendor.businessName || auth.vendor.ownerName || 'Vendor';
    } else if (auth.user) {
      email = auth.user.email;
      targetName = auth.user.fullName || 'User';
    }

    if (!email) {
      throw new BadRequestException('No email address registered for this account');
    }

    // 3. Generate a new random password
    const newPassword = Math.random().toString(36).substring(2, 10); // 8 character random string

    // 4. Hash the new password and update in database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    auth.password = hashedPassword;
    await this.authRepo.save(auth);

    // 5. Send password email using SMTP transport or console fallback
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || 'no-reply@freshways.com';

    let emailSent = false;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Freshways Support" <${smtpFrom}>`,
          to: email,
          subject: 'Freshways - Forgot Password Request',
          text: `Hello ${targetName},\n\nYour temporary password is: ${newPassword}\n\nPlease log in to your account using this temporary password and update it immediately.\n\nRegards,\nFreshways Team`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #4CAF50;">Forgot Password Request</h2>
              <p>Hello <strong>${targetName}</strong>,</p>
              <p>We received a request to recover your password for the username <strong>${username}</strong>.</p>
              <p>Your new temporary password is:</p>
              <div style="background-color: #f2f2f2; padding: 15px; font-size: 20px; font-weight: bold; border-radius: 5px; text-align: center; margin: 20px 0; letter-spacing: 2px;">
                ${newPassword}
              </div>
              <p style="color: #ff9800;">Please log in to your account using this temporary password and change it immediately for security.</p>
              <br/>
              <p>Regards,<br/><strong>Freshways Team</strong></p>
            </div>
          `,
        });
        emailSent = true;
      } catch (error) {
        console.error('SMTP Email sending error:', error);
      }
    } else {
      console.log('SMTP settings not configured in .env. Password generated and logged here:');
      console.log(`------------------------------------`);
      console.log(`User: ${username} (Email: ${email})`);
      console.log(`New Password: ${newPassword}`);
      console.log(`------------------------------------`);
    }

    return {
      message: emailSent
        ? 'A new temporary password has been sent to your registered email address.'
        : 'Password reset successful. Check backend console logs for the temporary password.',
    };
  }

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
