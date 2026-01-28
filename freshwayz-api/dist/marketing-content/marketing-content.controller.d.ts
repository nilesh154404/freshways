import { MarketingContentService } from './marketing-content.service';
import { UpdateMarketingContentDto } from './dto/update-marketing-content.dto';
export declare class MarketingContentController {
    private readonly marketingService;
    constructor(marketingService: MarketingContentService);
    create(dto: any, files: {
        media_files?: Express.Multer.File[];
    }): Promise<import("./entities/marketing-content.entity").MarketingContent | null>;
    findAll(vendorId?: number, categoryId?: number, productId?: number): Promise<import("./entities/marketing-content.entity").MarketingContent[]>;
    findOne(id: number): Promise<import("./entities/marketing-content.entity").MarketingContent>;
    update(id: number, dto: UpdateMarketingContentDto, files?: {
        media_files?: Express.Multer.File[];
    }): Promise<import("./entities/marketing-content.entity").MarketingContent>;
    remove(id: number): Promise<import("./entities/marketing-content.entity").MarketingContent>;
    toggleSave(id: number, body: {
        userId: number;
        userType?: string;
    }): Promise<{
        message: string;
        saved: boolean;
    }>;
    addComment(id: number, body: {
        text: string;
        userId: number;
        userType?: string;
    }): Promise<{
        message: string;
        comment: import("./entities/marketing-comment.entity").MarketingComment;
    }>;
    deleteComment(commentId: number): Promise<{
        message: string;
    }>;
    sharePost(id: number): Promise<{
        deepLink: {
            deepLink: string;
        };
    }>;
    getSavedPosts(userId: number): Promise<import("./entities/marketing-content.entity").MarketingContent[]>;
}
