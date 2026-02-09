
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MarketingContent } from './marketing-content.entity';

@Entity('marketing_comments')
export class MarketingComment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    userType: string; // 'user', 'customer', or 'vendor'

    @Column({ type: 'text' })
    text: string;

    @ManyToOne(() => MarketingContent, (content) => content.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'marketing_content_id' })
    marketingContent: MarketingContent;

    @CreateDateColumn()
    createdAt: Date;
}
