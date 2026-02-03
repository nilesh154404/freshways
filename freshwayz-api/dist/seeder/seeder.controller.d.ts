import { Repository } from 'typeorm';
import { Vendor } from '../vendor/entities/vendor.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customer/entities/customer.entity';
import { UserType } from '../user-type/entities/user-type.entity';
export declare class SeederController {
    private readonly vendorRepo;
    private readonly productRepo;
    private readonly customerRepo;
    private readonly userTypeRepo;
    constructor(vendorRepo: Repository<Vendor>, productRepo: Repository<Product>, customerRepo: Repository<Customer>, userTypeRepo: Repository<UserType>);
    seedDashboardData(): Promise<{
        message: string;
    }>;
}
