import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { MarketingContent } from './marketing-content.entity';
import { Customer } from 'src/customer/entities/customer.entity';

@Entity('marketing_reports')
export class MarketingReport {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MarketingContent, (content) => content.reports, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'marketing_content_id' })
    marketingContent: MarketingContent;

    @ManyToOne(() => Customer, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ type: 'text' })
    reason: string;

    @CreateDateColumn()
    createdAt: Date;
}
