import { Customer } from "src/customer/entities/customer.entity";
import { Order } from "src/orders/entities/order.entity";
export declare class Community {
    id: number;
    name: string;
    slug: string;
    type: string;
    address: string;
    orders: Order[];
    customers: Customer[];
}
