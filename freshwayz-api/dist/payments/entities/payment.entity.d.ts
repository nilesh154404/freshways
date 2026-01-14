import { Order } from "src/orders/entities/order.entity";
export declare enum PaymentMethod {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED"
}
export declare class Payment {
    id: number;
    order: Order;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    transactionId: string;
    referenceNote: string;
    createdAt: Date;
}
