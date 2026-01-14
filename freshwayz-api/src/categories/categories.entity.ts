import { Product } from "src/products/entities/product.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
import { BaseEntity, Column, Entity, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Categories extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    label: string;

    @Column('bool', { default: true })
    is_active: boolean;

    @Column('text', { nullable: true })
    img_link: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    order: number

    @OneToMany(type => Product, products => products.category)
    products: Product[];

    @ManyToMany(() => Vendor, vendor => vendor.categories)
    vendors: Vendor[];
}