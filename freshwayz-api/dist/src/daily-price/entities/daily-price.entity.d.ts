import { Product } from "src/products/entities/product.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
export declare class DailyPrice {
    id: number;
    amount: number;
    mrp_amount: number;
    date: Date;
    isActive: boolean;
    product: Product;
    vendor: Vendor;
    createdAt: Date;
    updatedAt: Date;
}
