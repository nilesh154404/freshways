import { Order } from "src/orders/entities/order.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from "typeorm";

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

    /**
     * Dexpert's own gateway-side transaction reference (pg_transt_id),
     * stored separately from Freshways' internal transactionId.
     * Populated when the gateway returns it in a redirect response.
     */
    @Column({ nullable: true })
    pgTransactionId: string;

    /**
     * Timestamp of the FIRST webhook delivery received from Dexpert for this payment.
     * Remains NULL for payments whose status was resolved purely via browser redirect.
     */
    @Column({ type: 'timestamp', nullable: true })
    webhookReceivedAt: Date;

    /**
     * Running count of webhook deliveries received for this payment.
     * Used to detect duplicate and retried webhook calls.
     */
    @Column({ type: 'int', default: 0 })
    webhookAttempts: number;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;
}
