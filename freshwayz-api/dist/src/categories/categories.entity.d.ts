import { Product } from "src/products/entities/product.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
import { BaseEntity } from "typeorm";
export declare class Categories extends BaseEntity {
    id: number;
    label: string;
    is_active: boolean;
    img_link: string;
    name: string;
    order: number;
    products: Product[];
    vendors: Vendor[];
}
