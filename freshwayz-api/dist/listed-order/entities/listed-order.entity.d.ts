import { Order } from "src/orders/entities/order.entity";
import { ProductDiscount } from "src/product-discount/entities/product-discount.entity";
import { Product } from "src/products/entities/product.entity";
export declare class ListedOrder {
    id: number;
    order: Order;
    product: Product | null;
    productName: string | null;
    quantity: number | null;
    amount: number | null;
    discountedAmount: number | null;
    productDiscount: ProductDiscount | null;
    notes: string | null;
}
