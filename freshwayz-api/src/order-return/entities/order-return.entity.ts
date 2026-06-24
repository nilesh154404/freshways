import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity('order_returns')
export class OrderReturn {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, { eager: true, nullable: false })
  customer: Customer;

  @ManyToOne(() => Order, { eager: true, nullable: false })
  order: Order;

  @ManyToOne(() => Product, { eager: true, nullable: true })
  product: Product | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  productName: string | null;

  @Column({ type: 'varchar', length: 255 })
  contactName: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'CANCELLED'],
    default: 'PENDING'
  })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
