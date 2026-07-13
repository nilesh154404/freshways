import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Customer } from "src/customer/entities/customer.entity";
import { VendorSubscriptionPlan } from "src/vendor-subscription-plan/entities/vendor-subscription-plan.entity";

@Entity()
export class Subscription {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Customer, customer => customer.subscriptions, { eager: true })
    customer: Customer;

    @ManyToOne(() => VendorSubscriptionPlan, plan => plan.subscriptions, { eager: true, onDelete: 'CASCADE' })
    plan: VendorSubscriptionPlan;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    startDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    endDate?: Date;

    @Column({ default: true })
    active: boolean;
}
