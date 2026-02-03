import { Repository } from 'typeorm';
import { VendorSubscriptionPlan } from './entities/vendor-subscription-plan.entity';
import { CreateVendorSubscriptionPlanDto } from './dto/create-vendor-subscription-plan.dto';
import { UpdateVendorSubscriptionPlanDto } from './dto/update-vendor-subscription-plan.dto';
export declare class VendorSubscriptionPlanService {
    private readonly repo;
    constructor(repo: Repository<VendorSubscriptionPlan>);
    private transformToResponse;
    create(dto: CreateVendorSubscriptionPlanDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateVendorSubscriptionPlanDto): Promise<any>;
    remove(id: number): Promise<VendorSubscriptionPlan[]>;
    findByVendor(vendorId: number): Promise<any[]>;
}
