import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Payment } from './payment.entity';

/**
 * payment_log
 *
 * One row is written every time the Freshways webhook API is called.
 * Captures the before-status, after-status, raw payload and source so
 * there is a full audit trail of every payment status change.
 */
@Entity('payment_log')
export class PaymentLog {
  @PrimaryGeneratedColumn()
  id: number;

  /** FK to the payment this log entry belongs to */
  @ManyToOne(() => Payment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'paymentId' })
  payment?: Payment;

  /** The transactionId that was looked up */
  @Column({ nullable: true })
  transactionId?: string;

  /** Payment status BEFORE this webhook call */
  @Column({ nullable: true })
  previousStatus?: string;

  /** Payment status AFTER this webhook call */
  @Column({ nullable: true })
  newStatus?: string;

  /** Who triggered this change: 'webhook' | 'redirect' | 'reconciliation' */
  @Column({ nullable: true })
  source?: string;

  /** The raw JSON body that was sent to the webhook endpoint */
  @Column({ type: 'text', nullable: true })
  rawPayload?: string;

  /** Human-readable outcome message e.g. 'updated', 'already_final', 'unknown_transaction' */
  @Column({ nullable: true })
  outcome?: string;

  /** Timestamp when this log entry was created */
  @CreateDateColumn()
  createdAt: Date;
}

