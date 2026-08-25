import { ApiProperty } from "@nestjs/swagger";
import { Auth } from "src/auth/entities/auth.entity";
import { Community } from "src/community/entities/community.entity";
import { Order } from "src/orders/entities/order.entity";
import { Subscription } from "src/subscription/entities/subscription.entity";
import { UserType } from "src/user-type/entities/user-type.entity";
import { VendorSubscriptionPlan } from "src/vendor-subscription-plan/entities/vendor-subscription-plan.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ type: "date", nullable: true })
    dob: Date;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    flatNo: string;

    @Column({ nullable: true })
    floorNo: string;

    @Column({ nullable: true })
    address: string;

    @ApiProperty({ description: 'Whether the customer account is active', default: true })
    @Column({ default: true })
    isActive: boolean;

    @ApiProperty({ description: 'Soft-delete timestamp. Null if account is active.', nullable: true })
    @Column({ type: 'timestamp', nullable: true, default: null })
    deletedAt: Date | null;

    @ManyToOne(() => UserType, userType => userType.users, { nullable: false })
    userType: UserType;

    // @OneToOne(() => Auth, auth => auth.user, { nullable: true })
    // auth?: Auth;

    @OneToOne(() => Auth, auth => auth.customer, { nullable: true })
    auth: Auth;

    // @ManyToOne(() => VendorSubscriptionPlan, vendorSubscriptionPlan => vendorSubscriptionPlan.customer, { nullable: true })
    // vendorSubscriptionPlan: VendorSubscriptionPlan;

    @OneToMany(() => Subscription, subscription => subscription.customer)
    subscriptions: Subscription[];

    @OneToMany(() => Order, order => order.customer)
    orders: Order[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(() => Community, community => community.customers)
    communities: Community[];
}
