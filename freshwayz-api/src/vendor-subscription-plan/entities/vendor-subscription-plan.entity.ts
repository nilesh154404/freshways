import { Customer } from "src/customer/entities/customer.entity";
import { DeliverySlot } from "src/delivery-slot/entities/delivery-slot.entity";
import { Order } from "src/orders/entities/order.entity";
import { Product } from "src/products/entities/product.entity";
import { Subscription } from "src/subscription/entities/subscription.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class VendorSubscriptionPlan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 30 })
    label: string;

    @Column({ length: 100 })
    description: string;

    @OneToMany(() => Product, product => product.vendorSubscriptionPlan)
    products?: Product;

    
    @OneToMany(() => Order, order => order.vendorSubscriptionPlan)
    order?: Order;

    // @OneToMany(() => Customer, customer => customer.vendorSubscriptionPlan)
    // customer?: Customer;

    @OneToMany(() => Subscription, subscription => subscription.plan)
    subscriptions?: Subscription[];

    @ManyToOne(() => Vendor, vendor => vendor.vendorSubscriptionPlan)
    @JoinColumn({ name: 'vendorId' })
    vendor: Vendor;

    @OneToMany(() => DeliverySlot, deliverySlot => deliverySlot.vendorSubscriptionPlan, { nullable: true })
    deliverySlot: DeliverySlot;

}
