import { VendorSubscriptionPlanService } from './vendor-subscription-plan.service';
import { CreateVendorSubscriptionPlanDto } from './dto/create-vendor-subscription-plan.dto';
import { UpdateVendorSubscriptionPlanDto } from './dto/update-vendor-subscription-plan.dto';
export declare class VendorSubscriptionPlanController {
    private readonly service;
    constructor(service: VendorSubscriptionPlanService);
    create(dto: CreateVendorSubscriptionPlanDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateVendorSubscriptionPlanDto): Promise<any>;
    remove(id: number): Promise<import("./entities/vendor-subscription-plan.entity").VendorSubscriptionPlan[]>;
    getPlanByVendor(vendorId: number): Promise<any[]>;
}
