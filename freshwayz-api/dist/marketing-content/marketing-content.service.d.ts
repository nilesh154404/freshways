import { Repository } from 'typeorm';
import { MarketingContent } from './entities/marketing-content.entity';
import { MarketingSave } from './entities/marketing-save.entity';
import { MarketingComment } from './entities/marketing-comment.entity';
import { CreateMarketingContentDto } from './dto/create-marketing-content.dto';
import { UpdateMarketingContentDto } from './dto/update-marketing-content.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
export declare class MarketingContentService {
    private readonly marketingRepo;
    private readonly saveRepo;
    private readonly commentRepo;
    private readonly fileUploadService;
    constructor(marketingRepo: Repository<MarketingContent>, saveRepo: Repository<MarketingSave>, commentRepo: Repository<MarketingComment>, fileUploadService: FileUploadService);
    create(dto: CreateMarketingContentDto, files?: Express.Multer.File[]): Promise<MarketingContent | null>;
    findAll(): Promise<MarketingContent[]>;
    findOne(id: number): Promise<MarketingContent>;
    update(id: number, dto: UpdateMarketingContentDto, files?: Express.Multer.File[]): Promise<MarketingContent>;
    remove(id: number): Promise<MarketingContent>;
    filter(filters: {
        vendorId?: number;
        categoryId?: number;
        productId?: number;
    }): Promise<MarketingContent[]>;
    toggleSave(contentId: number, userId: number, userType: string): Promise<{
        message: string;
        saved: boolean;
    }>;
    addComment(contentId: number, text: string, userId: number, userType: string): Promise<{
        message: string;
        comment: MarketingComment;
    }>;
    deleteComment(commentId: number): Promise<{
        message: string;
    }>;
    incrementShare(contentId: number): Promise<{
        message: string;
        shareCount: number;
    }>;
    getSavedPosts(userId: number): Promise<MarketingContent[]>;
}
