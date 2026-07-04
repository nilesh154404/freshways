import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { VendorSubscriptionPlan } from '../../vendor-subscription-plan/entities/vendor-subscription-plan.entity';

@Entity('customer_product_list')
export class CustomerProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, { eager: true })
  customer: Customer;

  @ManyToOne(() => VendorSubscriptionPlan, { eager: true, nullable: true })
  vendorSubscriptionPlan: VendorSubscriptionPlan | null;

  // OPTIONAL product reference
  @ManyToOne(() => Product, { nullable: true, eager: true })
  product: Product | null;

  // HAND-WRITTEN FIELDS (IMPORTANT: nullable true)
  @Column({ type: 'varchar', length: 255, nullable: true })
  productName: string | null;

  @Column({ type: 'int', nullable: true })
  quantity: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string | null;
}
