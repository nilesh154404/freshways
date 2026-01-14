import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { VendorSubscriptionPlan } from 'src/vendor-subscription-plan/entities/vendor-subscription-plan.entity';
export declare class SubscriptionService {
    private readonly subscriptionRepo;
    private readonly customerRepo;
    private readonly planRepo;
    constructor(subscriptionRepo: Repository<Subscription>, customerRepo: Repository<Customer>, planRepo: Repository<VendorSubscriptionPlan>);
    create(dto: CreateSubscriptionDto): Promise<Subscription>;
    findAll(): Promise<Subscription[]>;
    findOne(id: number): Promise<Subscription>;
    update(id: number, dto: UpdateSubscriptionDto): Promise<Subscription>;
    remove(id: number): Promise<Subscription>;
    findByCustomer(customerId: number, onlyActive?: boolean): Promise<Subscription[]>;
    findByVendor(vendorId: number, onlyActive?: boolean): Promise<Subscription[]>;
    findByCustomerAndVendor(customerId: number, vendorId: number, onlyActive?: boolean): Promise<Subscription[]>;
}
