import { Product } from '../../products/entities/product.entity';
import { User } from '../../user/entities/user.entity';
import { VendorSubscriptionPlan } from '../../vendor-subscription-plan/entities/vendor-subscription-plan.entity';
export declare class CustomerProduct {
    id: number;
    customer: User;
    vendorSubscriptionPlan: VendorSubscriptionPlan;
    product: Product | null;
    productName: string | null;
    quantity: number | null;
    amount: number | null;
    notes: string | null;
}
