import { Order } from "src/orders/entities/order.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

export enum PaymentMethod {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE",
}

export enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
}

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, order => order.payments, { nullable: false })
    order: Order;

    // ONLINE / OFFLINE
    @Column({
        type: "enum",
        enum: PaymentMethod,
    })
    method: PaymentMethod;

    // Payment status
    @Column({
        type: "enum",
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    status: PaymentStatus;

    // Amount paid
    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount: number;

    // Gateway transaction id (online only)
    @Column({ nullable: true })
    transactionId: string;

    // Generated receipt number for successful payments
    @Column({ nullable: true })
    receiptNumber: string;

    // For offline references → (cash, manual UPI, cheque, bank transfer)
    @Column({ nullable: true })
    referenceNote: string;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;
}
