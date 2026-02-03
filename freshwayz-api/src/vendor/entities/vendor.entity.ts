import { Auth } from "src/auth/entities/auth.entity";
import { Categories } from "src/categories/categories.entity";
import { DailyPrice } from "src/daily-price/entities/daily-price.entity";
import { Order } from "src/orders/entities/order.entity";
import { Product } from "src/products/entities/product.entity";
import { UserType } from "src/user-type/entities/user-type.entity";
import { VendorSubscriptionPlan } from "src/vendor-subscription-plan/entities/vendor-subscription-plan.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class Vendor {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    businessName: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    gstNumber: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    website?: string;

    @Column({ nullable: true })
    ownerName: string;

    @Column({ nullable: true })
    bankName?: string;

    @Column({ nullable: true })
    accountNumber?: string;

    @Column({ nullable: true })
    ifscCode?: string;

    @OneToOne(() => Auth, auth => auth.vendor, { nullable: true })
    // @JoinColumn()
    auth?: Auth;

    @ManyToOne(() => UserType, t => t.vendors, { nullable: false })
    userType: UserType;

    @OneToMany(() => Order, order => order.vendor)
    orders: Order[];

    @OneToMany(() => VendorSubscriptionPlan, vendorSubscriptionPlan => vendorSubscriptionPlan.vendor, { nullable: true })
    vendorSubscriptionPlan: VendorSubscriptionPlan;

    @OneToMany(() => Product, product => product.vendor)
    products?: Product;

    @OneToMany(() => DailyPrice, dailyPrice => dailyPrice.vendor)
    dailyPrice: DailyPrice;

    // Many-to-Many relationship with Categories
    @ManyToMany(() => Categories, category => category.vendors)
    @JoinTable({
        name: 'vendor_categories', // custom join table name
        joinColumn: { name: 'vendor_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
    })
    categories: Categories[];
}
