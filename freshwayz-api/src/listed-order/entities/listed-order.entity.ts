import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { Order } from "src/orders/entities/order.entity";
import { ProductDiscount } from "src/product-discount/entities/product-discount.entity";
import { Product } from "src/products/entities/product.entity";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

@Entity()
export class ListedOrder {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, order => order.listedOrders, { nullable: false })
    @Exclude()   // 👈 prevents circular JSON
    order: Order;

    // Optional product linkage
    @ManyToOne(() => Product, { nullable: true })
    product: Product | null;

    // Hand-written / manual fields
    @Column({ type: 'varchar', length: 255, nullable: true })
    productName: string | null;

    @Column({ type: 'int', nullable: true })
    quantity: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    amount: number | null;
    
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    discountedAmount: number | null;  // after discount

    @ManyToOne(() => ProductDiscount, { nullable: true })
    productDiscount: ProductDiscount | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    notes: string | null;
}
