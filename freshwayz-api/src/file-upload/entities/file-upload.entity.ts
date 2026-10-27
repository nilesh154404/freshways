// src/file-upload/entities/file-upload.entity.ts
import { MarketingContent } from 'src/marketing-content/entities/marketing-content.entity';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class FileUpload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @AfterLoad()
  @BeforeInsert()
  @BeforeUpdate()
  normalizeFileUrl() {
    if (this.fileUrl) {
      this.fileUrl = this.fileUrl
        .replace(/https?:\/\/freshwayz\.dexpertsystems\.com\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads')
        .replace(/http:\/\/192\.168\.\d+\.\d+:\d+\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads')
        .replace(/http:\/\/localhost:\d+\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads');
    }
  }

  @Column({ nullable: true })
  marketingContentId?: number;

  @ManyToOne(() => MarketingContent, (mc) => mc.media, {
    onDelete: 'CASCADE',
    nullable: true
  })
  @JoinColumn({ name: 'marketingContentId' })
  marketingContent?: MarketingContent;

  @Column({ nullable: true })
  customerId?: number;

  @Column({ nullable: true })
  tenantId?: number;

  @Column({ nullable: true })
  vendorId?: number;

  @Column({ nullable: true })
  orderId?: number;

  @CreateDateColumn()
  createdAt: Date;
}
