import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "src/products/entities/product.entity";
import { DiscountType } from "./discount-type.enum";

@Entity()
export class ProductDiscount {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: DiscountType
  })
  type: DiscountType;

  // For PERCENTAGE & FLAT
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value: number;

  // BOGO rules
  @Column({ nullable: true })
  buyQuantity: number; // eg: 1, 2

  @Column({ nullable: true })
  getQuantity: number; // eg: 1

  // Minimum quantity needed in cart to activate offer
  @Column()
  minCartQuantity: number;

  // Duration
  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Product, product => product.discounts, { onDelete: 'CASCADE' })
  product: Product;
}
