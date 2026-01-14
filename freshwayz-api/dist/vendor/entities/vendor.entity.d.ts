import { Auth } from "src/auth/entities/auth.entity";
import { Categories } from "src/categories/categories.entity";
import { DailyPrice } from "src/daily-price/entities/daily-price.entity";
import { Order } from "src/orders/entities/order.entity";
import { Product } from "src/products/entities/product.entity";
import { UserType } from "src/user-type/entities/user-type.entity";
import { VendorSubscriptionPlan } from "src/vendor-subscription-plan/entities/vendor-subscription-plan.entity";
export declare class Vendor {
    id: number;
    businessName: string;
    email: string;
    gstNumber: string;
    address: string;
    ownerName: string;
    auth?: Auth;
    userType: UserType;
    orders: Order[];
    vendorSubscriptionPlan: VendorSubscriptionPlan;
    products?: Product;
    dailyPrice: DailyPrice;
    categories: Categories[];
}
