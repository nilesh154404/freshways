import { Categories } from "src/categories/categories.entity";
import { DailyPrice } from "src/daily-price/entities/daily-price.entity";
import { ProductDiscount } from "src/product-discount/entities/product-discount.entity";
import { ServiceOffering } from "src/service-offering/entities/service-offering.entity";
import { VendorSubscriptionPlan } from "src/vendor-subscription-plan/entities/vendor-subscription-plan.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductCustomizationGroup } from "./product-customization-group.entity";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    label: string;

    @Column({ type: 'text' })
    description: string;

    @Column()
    productUrl: string;

    @AfterLoad()
    @BeforeInsert()
    @BeforeUpdate()
    normalizeProductUrl() {
        if (this.productUrl) {
            this.productUrl = this.productUrl
                .replace(/https?:\/\/freshwayz\.dexpertsystems\.com\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads')
                .replace(/http:\/\/192\.168\.\d+\.\d+:\d+\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads')
                .replace(/http:\/\/localhost:\d+\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads');
        }
    }

    @Column()
    measurementUnit: string;

    @Column()
    measurementValue: string;

    @Column({ default: 'VEG' })
    productType: string;

    @ManyToOne(() => ServiceOffering, serviceOffering => serviceOffering.products, { nullable: true })
    serviceOffering: ServiceOffering;

    @OneToMany(() => DailyPrice, dailyPrice => dailyPrice.product)
    dailyPrices: DailyPrice[];

    @ManyToOne(() => Vendor, vendor => vendor.products, { nullable: true })
    vendor: Vendor;

    @ManyToOne(() => VendorSubscriptionPlan, vendorSubscriptionPlan => vendorSubscriptionPlan.products, { nullable: true, onDelete: 'SET NULL' })
    vendorSubscriptionPlan: VendorSubscriptionPlan;

    @ManyToOne(type => Categories, category => category.products)
    @JoinColumn({ name: "category", referencedColumnName: "id" })
    category: Categories;

    @OneToMany(() => ProductDiscount, discount => discount.product)
    discounts: ProductDiscount[];

    @OneToMany(() => ProductCustomizationGroup, group => group.product)
    customizationGroups: ProductCustomizationGroup[];
}
