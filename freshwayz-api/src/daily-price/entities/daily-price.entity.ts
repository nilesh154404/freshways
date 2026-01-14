import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Product } from "src/products/entities/product.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";

@Entity()
// @Unique(["product", "date"]) // Only one record per product per date
// @Unique(["product", "isActive"]) // Only one active price per product
@Unique(["product", "vendor", "date"]) // one price per day
@Index(["product", "vendor"], { unique: true, where: "isActive = true" }) // one active price
export class DailyPrice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount: number;


    @Column({ type: "decimal", precision: 10, scale: 2 })
    mrp_amount: number;

    @Column({ type: "date" })
    date: Date;

    @Column({ default: false })
    isActive: boolean;

    @ManyToOne(() => Product, product => product.dailyPrices, { nullable: false })
    product: Product;

    @ManyToOne(() => Vendor, vendor => vendor.dailyPrice, { nullable: false })
    vendor: Vendor;
}

// import { Vendor } from "src/vendor/entities/vendor.entity";
// import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

// @Entity()
// export class DailyPrice {
//     @PrimaryGeneratedColumn()
//     id: number;

//     @Column()
//     amount: number;

//     @Column()
//     date: Date;

//     @Column()
//     isActive: Boolean;

//     @ManyToOne(() => Vendor, vendor => vendor.dailyPrice, { nullable: false })
//     vendor: Vendor;
// }