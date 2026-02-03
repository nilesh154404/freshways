// src/marketing/entities/marketing-content.entity.ts
import { Categories } from 'src/categories/categories.entity';
import { FileUpload } from 'src/file-upload/entities/file-upload.entity';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { MarketingComment } from '../interactions/interactions.entity';

@Entity('marketing_contents')
export class MarketingContent {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Categories, { eager: true })
    @JoinColumn({ name: "category", referencedColumnName: "id" })
    category: Categories;

    @ManyToOne(() => Product, { eager: true, nullable: true })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Vendor, { eager: true })
    @JoinColumn({ name: 'vendor_id' })
    vendor: Vendor;

    @Column({ type: 'text', nullable: true })
    description: string;

    @OneToMany(() => FileUpload, (file) => file.marketingContent)
    media: FileUpload[];

    // Interactions
    @OneToMany(() => MarketingComment, (comment) => comment.marketingContent)
    comments: MarketingComment[];

    @Column({ default: 0 })
    likes_count: number;

    @Column({ default: 0 })
    shares_count: number;

    @Column({ default: 0 })
    saves_count: number;

    @Column({ default: 0 })
    comments_count: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
