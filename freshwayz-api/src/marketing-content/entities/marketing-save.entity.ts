// src/marketing-content/entities/marketing-save.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { MarketingContent } from './marketing-content.entity';

@Entity('marketing_saves')
export class MarketingSave {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  userType: string; // 'user', 'customer', or 'vendor'

  @ManyToOne(() => MarketingContent, (marketing) => marketing.saves, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'marketing_content_id' })
  marketingContent: MarketingContent;

  @CreateDateColumn()
  createdAt: Date;
}
