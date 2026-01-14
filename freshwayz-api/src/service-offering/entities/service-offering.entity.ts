import { Product } from "src/products/entities/product.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class ServiceOffering {
    @PrimaryColumn({ length: 10 })
    serviceCode: string;

    @Column({ length: 20 })
    serviceName: string;

    @Column({ length: 150 })
    description: string;

    @OneToMany(() => Product, product => product.serviceOffering)
    products: Product[];
}
