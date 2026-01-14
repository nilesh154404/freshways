import { Product } from "src/products/entities/product.entity";
import { DiscountType } from "./discount-type.enum";
export declare class ProductDiscount {
    id: number;
    type: DiscountType;
    value: number;
    buyQuantity: number;
    getQuantity: number;
    minCartQuantity: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    product: Product;
}
