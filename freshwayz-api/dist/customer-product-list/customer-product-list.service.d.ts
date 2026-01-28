import { Repository } from 'typeorm';
import { CustomerProduct } from './entities/customer-product.entity';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { User } from '../user/entities/user.entity';
import { VendorSubscriptionPlan } from '../vendor-subscription-plan/entities/vendor-subscription-plan.entity';
import { Product } from '../products/entities/product.entity';
export declare class CustomerProductListService {
    private readonly customerProductRepo;
    private readonly userRepo;
    private readonly productRepo;
    private readonly planRepo;
    constructor(customerProductRepo: Repository<CustomerProduct>, userRepo: Repository<User>, productRepo: Repository<Product>, planRepo: Repository<VendorSubscriptionPlan>);
    create(dto: CreateCustomerProductDto): Promise<CustomerProduct>;
    getByCustomerId(customerId: number): Promise<CustomerProduct[]>;
    deleteById(id: number): Promise<CustomerProduct>;
}
