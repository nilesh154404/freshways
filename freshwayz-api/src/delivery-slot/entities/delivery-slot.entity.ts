// delivery-slot.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'src/orders/entities/order.entity';
import { VendorSubscriptionPlan } from 'src/vendor-subscription-plan/entities/vendor-subscription-plan.entity';

@Entity('delivery_slots')
export class DeliverySlot {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '2025-01-01' })
  @Column({ type: 'date', nullable: true })
  date: string;

  @ApiProperty({ example: '10:00' })
  @Column({ nullable: true })
  startTime: string;

  @ApiProperty({ example: '12:00' })
  @Column({ nullable: true })
  endTime: string;

  @ApiProperty({ example: 20 })
  @Column({ type: 'int', nullable: true })
  capacity: number;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => VendorSubscriptionPlan, vendorSubscriptionPlan => vendorSubscriptionPlan.deliverySlot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendorSubscriptionPlanId' })
  vendorSubscriptionPlan: VendorSubscriptionPlan;

  @OneToMany(() => Order, order => order.deliverySlot)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
