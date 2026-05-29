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
    bloodGroup: string;

    @Column({ type: "float", nullable: true })
    height: number;

    @Column({ type: "float", nullable: true })
    weight: number;

    @Column({ type: "text", nullable: true })
    medicalHistory: string;

    @Column({ type: "text", nullable: true })
    goal: string;

    @Column({ nullable: true })
    community: string;

    @Column({ nullable: true })
    landmark: string;

    @Column({ nullable: true })
    locality: string;

    @Column({ nullable: true })
    dietPreference: string;

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
