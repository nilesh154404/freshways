import { Order } from 'src/orders/entities/order.entity';
import { VendorSubscriptionPlan } from 'src/vendor-subscription-plan/entities/vendor-subscription-plan.entity';
export declare class DeliverySlot {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    isActive: boolean;
    vendorSubscriptionPlan: VendorSubscriptionPlan;
    orders: Order[];
    createdAt: Date;
    updatedAt: Date;
}
