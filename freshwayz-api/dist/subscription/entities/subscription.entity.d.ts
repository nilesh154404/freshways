import { Customer } from "src/customer/entities/customer.entity";
import { VendorSubscriptionPlan } from "src/vendor-subscription-plan/entities/vendor-subscription-plan.entity";
export declare class Subscription {
    id: number;
    customer: Customer;
    plan: VendorSubscriptionPlan;
    startDate: Date;
    endDate?: Date;
    active: boolean;
}
