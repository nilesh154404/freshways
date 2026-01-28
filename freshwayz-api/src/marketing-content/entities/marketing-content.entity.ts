// src/marketing/entities/marketing-content.entity.ts
import { Categories } from 'src/categories/categories.entity';
import { FileUpload } from 'src/file-upload/entities/file-upload.entity';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { MarketingComment } from './marketing-comment.entity';
import { MarketingLike } from './marketing-like.entity';
import { MarketingSave } from './marketing-save.entity';
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

    @Column({ default: 0 })
    shareCount: number;

    @OneToMany(() => FileUpload, (file) => file.marketingContent)
    media: FileUpload[];

    @OneToMany(() => MarketingComment, (comment) => comment.marketingContent)
    comments: MarketingComment[];

    @OneToMany(() => MarketingLike, (like) => like.marketingContent)
    likes: MarketingLike[];

    @OneToMany(() => MarketingSave, (save) => save.marketingContent)
    saves: MarketingSave[];
}
