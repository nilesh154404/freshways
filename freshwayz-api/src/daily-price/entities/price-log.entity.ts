import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "src/products/entities/product.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";

@Entity('price_logs')
export class PriceLog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Product, { nullable: false })
    product: Product;

    @ManyToOne(() => Vendor, { nullable: false })
    vendor: Vendor;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    old_amount: number | null;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    new_amount: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    old_mrp: number | null;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    new_mrp: number;

    @CreateDateColumn()
    changedAt: Date;
}
