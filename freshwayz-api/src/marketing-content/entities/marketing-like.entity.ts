
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { MarketingContent } from './marketing-content.entity';

@Entity('marketing_likes')
export class MarketingLike {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => MarketingContent, (content) => content.likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'marketing_content_id' })
    marketingContent: MarketingContent;

    @CreateDateColumn()
    createdAt: Date;
}
