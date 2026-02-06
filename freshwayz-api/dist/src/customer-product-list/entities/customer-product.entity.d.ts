import { Product } from '../../products/entities/product.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { VendorSubscriptionPlan } from '../../vendor-subscription-plan/entities/vendor-subscription-plan.entity';
export declare class CustomerProduct {
    id: number;
    customer: Customer;
    vendorSubscriptionPlan: VendorSubscriptionPlan;
    product: Product | null;
    productName: string | null;
    quantity: number | null;
    amount: number | null;
    notes: string | null;
}
