import { Repository } from 'typeorm';
import { VendorSubscriptionPlan } from './entities/vendor-subscription-plan.entity';
import { CreateVendorSubscriptionPlanDto } from './dto/create-vendor-subscription-plan.dto';
import { UpdateVendorSubscriptionPlanDto } from './dto/update-vendor-subscription-plan.dto';
export declare class VendorSubscriptionPlanService {
    private readonly repo;
    constructor(repo: Repository<VendorSubscriptionPlan>);
    create(dto: CreateVendorSubscriptionPlanDto): Promise<VendorSubscriptionPlan>;
    findAll(): Promise<VendorSubscriptionPlan[]>;
    findOne(id: number): Promise<VendorSubscriptionPlan>;
    update(id: number, dto: UpdateVendorSubscriptionPlanDto): Promise<VendorSubscriptionPlan>;
    remove(id: number): Promise<VendorSubscriptionPlan>;
    findByVendor(vendorId: number): Promise<VendorSubscriptionPlan[]>;
}
