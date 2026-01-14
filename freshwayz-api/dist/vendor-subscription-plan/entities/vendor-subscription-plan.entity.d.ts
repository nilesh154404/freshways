import { DeliverySlot } from "src/delivery-slot/entities/delivery-slot.entity";
import { Order } from "src/orders/entities/order.entity";
import { Product } from "src/products/entities/product.entity";
import { Subscription } from "src/subscription/entities/subscription.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
export declare class VendorSubscriptionPlan {
    id: number;
    label: string;
    description: string;
    products?: Product;
    order?: Order;
    subscriptions?: Subscription[];
    vendor: Vendor;
    deliverySlot: DeliverySlot;
}
