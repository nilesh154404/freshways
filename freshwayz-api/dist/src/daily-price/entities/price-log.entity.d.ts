import { Product } from "src/products/entities/product.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
export declare class PriceLog {
    id: number;
    product: Product;
    vendor: Vendor;
    old_amount: number | null;
    new_amount: number;
    old_mrp: number | null;
    new_mrp: number;
    changedAt: Date;
}
