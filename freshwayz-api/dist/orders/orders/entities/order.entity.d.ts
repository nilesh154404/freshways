import { Customer } from "src/customer/entities/customer.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
import { Community } from "src/community/entities/community.entity";
import { ListedOrder } from "src/listed-order/entities/listed-order.entity";
import { Payment } from "src/payments/entities/payment.entity";
import { DeliverySlot } from "src/delivery-slot/entities/delivery-slot.entity";
import { VendorSubscriptionPlan } from "src/vendor-subscription-plan/entities/vendor-subscription-plan.entity";
export declare class Order {
    id: number;
    customer: Customer;
    vendor: Vendor | null;
    community: Community;
    vendorSubscriptionPlan?: VendorSubscriptionPlan;
    deliverySlot: DeliverySlot | null;
    createdAt: Date;
    completedAt: Date;
    orderStatus: string;
    paymentStatus: string;
    deliveryDate: Date | null;
    isDeleted: boolean;
    grandTotal: number;
    listedOrders: ListedOrder[];
    payments: Payment[];
}
