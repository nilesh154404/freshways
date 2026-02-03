import { Categories } from 'src/categories/categories.entity';
import { FileUpload } from 'src/file-upload/entities/file-upload.entity';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { MarketingComment } from '../interactions/interactions.entity';
export declare class MarketingContent {
    id: number;
    category: Categories;
    product: Product;
    vendor: Vendor;
    description: string;
    media: FileUpload[];
    comments: MarketingComment[];
    likes_count: number;
    shares_count: number;
    saves_count: number;
    comments_count: number;
    created_at: Date;
    updated_at: Date;
}
