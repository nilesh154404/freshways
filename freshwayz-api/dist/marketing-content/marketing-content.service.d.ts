import { Repository } from 'typeorm';
import { MarketingContent } from './entities/marketing-content.entity';
import { CreateMarketingContentDto } from './dto/create-marketing-content.dto';
import { UpdateMarketingContentDto } from './dto/update-marketing-content.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { MarketingLike, MarketingSave, MarketingShare, MarketingComment } from './interactions/interactions.entity';
export declare class MarketingContentService {
    private readonly marketingRepo;
    private readonly likeRepo;
    private readonly saveRepo;
    private readonly shareRepo;
    private readonly commentRepo;
    private readonly fileUploadService;
    constructor(marketingRepo: Repository<MarketingContent>, likeRepo: Repository<MarketingLike>, saveRepo: Repository<MarketingSave>, shareRepo: Repository<MarketingShare>, commentRepo: Repository<MarketingComment>, fileUploadService: FileUploadService);
    create(dto: CreateMarketingContentDto, files?: Express.Multer.File[]): Promise<MarketingContent>;
    findAll(userId?: number, userRole?: string): Promise<MarketingContent[]>;
    getSavedPosts(userId: number, userRole: string): Promise<MarketingContent[]>;
    private enrichContents;
    findOne(id: number, userId?: number, userRole?: string): Promise<MarketingContent>;
    update(id: number, dto: UpdateMarketingContentDto, files?: Express.Multer.File[]): Promise<MarketingContent>;
    remove(id: number): Promise<MarketingContent>;
    filter(filters: {
        vendorId?: number;
        categoryId?: number;
        productId?: number;
    }): Promise<MarketingContent[]>;
    count(filters: {
        vendorId?: number;
    }): Promise<{
        total: number;
        growth: number;
        newThisMonth: number;
    }>;
    toggleSave(userId: number, postId: number, userRole: string): Promise<{
        saved: boolean;
        count: number;
    }>;
    incrementShare(postId: number, userId?: number, userRole?: string): Promise<void>;
    addComment(userId: number, postId: number, userRole: string, content: string): Promise<MarketingComment | null>;
    deleteComment(commentId: number): Promise<{
        success: boolean;
    }>;
}
