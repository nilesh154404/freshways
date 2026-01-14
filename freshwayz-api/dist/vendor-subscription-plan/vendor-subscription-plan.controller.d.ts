import { VendorSubscriptionPlanService } from './vendor-subscription-plan.service';
import { CreateVendorSubscriptionPlanDto } from './dto/create-vendor-subscription-plan.dto';
import { UpdateVendorSubscriptionPlanDto } from './dto/update-vendor-subscription-plan.dto';
export declare class VendorSubscriptionPlanController {
    private readonly service;
    constructor(service: VendorSubscriptionPlanService);
    create(dto: CreateVendorSubscriptionPlanDto): Promise<import("./entities/vendor-subscription-plan.entity").VendorSubscriptionPlan>;
    findAll(): Promise<import("./entities/vendor-subscription-plan.entity").VendorSubscriptionPlan[]>;
    findOne(id: number): Promise<import("./entities/vendor-subscription-plan.entity").VendorSubscriptionPlan>;
    update(id: number, dto: UpdateVendorSubscriptionPlanDto): Promise<import("./entities/vendor-subscription-plan.entity").VendorSubscriptionPlan>;
    remove(id: number): Promise<import("./entities/vendor-subscription-plan.entity").VendorSubscriptionPlan>;
    getPlanByVendor(vendorId: number): Promise<import("./entities/vendor-subscription-plan.entity").VendorSubscriptionPlan[]>;
}
