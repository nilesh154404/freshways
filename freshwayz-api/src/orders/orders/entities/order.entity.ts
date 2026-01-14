import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Customer } from "src/customer/entities/customer.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
import { Community } from "src/community/entities/community.entity";
import { ListedOrder } from "src/listed-order/entities/listed-order.entity";
import { Payment } from "src/payments/entities/payment.entity";
import { DeliverySlot } from "src/delivery-slot/entities/delivery-slot.entity";
import { VendorSubscriptionPlan } from "src/vendor-subscription-plan/entities/vendor-subscription-plan.entity";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Customer, customer => customer.orders, { nullable: false })
    customer: Customer;

    @ManyToOne(() => Vendor, vendor => vendor.orders, { nullable: true })
    vendor: Vendor | null;

    @ManyToOne(() => Community, community => community.orders, { nullable: false })
    community: Community;

    @ManyToOne(() => VendorSubscriptionPlan, vendorSubscriptionPlan => vendorSubscriptionPlan.order, { nullable: true })
    vendorSubscriptionPlan?: VendorSubscriptionPlan;

    @ManyToOne(() => DeliverySlot, deliverySlot => deliverySlot.orders, { nullable: true })
    deliverySlot: DeliverySlot | null;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @Column({
        type: 'enum',
        enum: ['DRAFTED', 'PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
        default: 'DRAFTED'
    })
    orderStatus: string;

    @Column({
        type: 'enum',
        enum: ['PENDING', 'PAID', 'PARTIAL', 'FAILED'],
        default: 'PENDING'
    })
    paymentStatus: string;

    @Column({ type: 'date', nullable: true })
    deliveryDate: Date | null;

    @Column({ default: false })
    isDeleted: boolean;

    // ✅ Added grand total for the order
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    grandTotal: number;

    @OneToMany(() => ListedOrder, listedOrder => listedOrder.order, { cascade: true })
    listedOrders: ListedOrder[];

    @OneToMany(() => Payment, payment => payment.order)
    payments: Payment[];

}
