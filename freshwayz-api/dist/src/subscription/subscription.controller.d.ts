import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    create(dto: CreateSubscriptionDto): Promise<import("./entities/subscription.entity").Subscription>;
    findAll(): Promise<import("./entities/subscription.entity").Subscription[]>;
    findOne(id: string): Promise<import("./entities/subscription.entity").Subscription>;
    update(id: string, dto: UpdateSubscriptionDto): Promise<import("./entities/subscription.entity").Subscription>;
    remove(id: string): Promise<import("./entities/subscription.entity").Subscription>;
    getByCustomer(customerId: string, active?: string): Promise<import("./entities/subscription.entity").Subscription[]>;
    getByVendor(vendorId: string, active?: string): Promise<import("./entities/subscription.entity").Subscription[]>;
    getByCustomerAndVendor(customerId: string, vendorId: string, active?: string): Promise<import("./entities/subscription.entity").Subscription[]>;
}
