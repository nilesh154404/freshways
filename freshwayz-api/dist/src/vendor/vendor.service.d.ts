import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { Categories } from 'src/categories/categories.entity';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { VendorDashboardStatsDto } from './dto/vendor-dashboard-stats.dto';
import { UserType } from 'src/user-type/entities/user-type.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { MarketingContent } from 'src/marketing-content/entities/marketing-content.entity';
import { Customer } from 'src/customer/entities/customer.entity';
export declare class VendorService {
    private readonly vendorRepo;
    private readonly categoriesRepo;
    private readonly userTypeRepo;
    private readonly orderRepo;
    private readonly productRepo;
    private readonly marketingContentRepo;
    private readonly customerRepo;
    constructor(vendorRepo: Repository<Vendor>, categoriesRepo: Repository<Categories>, userTypeRepo: Repository<UserType>, orderRepo: Repository<Order>, productRepo: Repository<Product>, marketingContentRepo: Repository<MarketingContent>, customerRepo: Repository<Customer>);
    findAll(): Promise<Vendor[]>;
    findOne(id: number): Promise<Vendor>;
    update(id: number, updateData: UpdateVendorDto): Promise<Vendor>;
    updateProfile(id: number, updateData: UpdateVendorProfileDto): Promise<Vendor>;
    remove(id: number): Promise<{
        message: string;
    }>;
    getDashboardStats(vendorId: number): Promise<VendorDashboardStatsDto>;
    private getWeeklyRevenue;
    private getWeeklyOrders;
}
