import { Entity, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';

@Entity('customer_vendor_blocks')
export class CustomerVendorBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @CreateDateColumn()
  createdAt: Date;
}
