import { Product } from "src/products/entities/product.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
import { BaseEntity, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, AfterLoad, BeforeInsert, BeforeUpdate } from "typeorm";

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

    @AfterLoad()
    @BeforeInsert()
    @BeforeUpdate()
    normalizeImgLink() {
        if (this.img_link) {
            this.img_link = this.img_link
                .replace(/https?:\/\/freshwayz\.dexpertsystems\.com\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads')
                .replace(/http:\/\/192\.168\.\d+\.\d+:\d+\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads')
                .replace(/http:\/\/localhost:\d+\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads');
        }
    }

    @Column()
    name: string;

    @Column({ nullable: true })
    order: number

    @OneToMany(type => Product, products => products.category)
    products: Product[];

    @ManyToMany(() => Vendor, vendor => vendor.categories)
    vendors: Vendor[];
}