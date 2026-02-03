import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { MarketingContent } from '../entities/marketing-content.entity';
import { User } from '../../user/entities/user.entity';
import { Customer } from '../../customer/entities/customer.entity';

@Entity('marketing_likes')
export class MarketingLike {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => MarketingContent, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'marketing_content_id' })
    marketingContent: MarketingContent;

    @CreateDateColumn()
    created_at: Date;
}

@Entity('marketing_saves')
export class MarketingSave {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => MarketingContent, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'marketing_content_id' })
    marketingContent: MarketingContent;

    @CreateDateColumn()
    created_at: Date;
}

@Entity('marketing_shares')
export class MarketingShare {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => MarketingContent, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'marketing_content_id' })
    marketingContent: MarketingContent;

    @CreateDateColumn()
    created_at: Date;
}

@Entity('marketing_comments')
export class MarketingComment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    content: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true, eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE', nullable: true, eager: true })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => MarketingContent, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'marketing_content_id' })
    marketingContent: MarketingContent;

    @CreateDateColumn()
    created_at: Date;
}
