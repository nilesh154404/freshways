import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminDashboardStatsDto } from './dto/admin-dashboard-stats.dto';
import { User } from './entities/user.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
export declare class UserService {
    private readonly userRepo;
    private readonly vendorRepo;
    private readonly customerRepo;
    private readonly productRepo;
    private readonly orderRepo;
    constructor(userRepo: Repository<User>, vendorRepo: Repository<Vendor>, customerRepo: Repository<Customer>, productRepo: Repository<Product>, orderRepo: Repository<Order>);
    create(createUserDto: CreateUserDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateUserDto: UpdateUserDto): string;
    remove(id: number): string;
    getAdminDashboardStats(): Promise<AdminDashboardStatsDto>;
    private getWeeklyRevenue;
    private getWeeklyOrders;
}
