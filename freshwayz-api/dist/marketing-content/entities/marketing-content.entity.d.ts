import { Categories } from 'src/categories/categories.entity';
import { FileUpload } from 'src/file-upload/entities/file-upload.entity';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { MarketingComment } from './marketing-comment.entity';
import { MarketingLike } from './marketing-like.entity';
import { MarketingSave } from './marketing-save.entity';
export declare class MarketingContent {
    id: number;
    category: Categories;
    product: Product;
    vendor: Vendor;
    description: string;
    shareCount: number;
    media: FileUpload[];
    comments: MarketingComment[];
    likes: MarketingLike[];
    saves: MarketingSave[];
}
