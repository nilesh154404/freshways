import { MarketingContentService } from './marketing-content.service';
export declare class MarketingContentController {
    private readonly marketingService;
    constructor(marketingService: MarketingContentService);
    create(dto: any, files: {
        media_files?: Express.Multer.File[];
    }): Promise<import("./entities/marketing-content.entity").MarketingContent>;
    getSavedPosts(req: any): Promise<import("./entities/marketing-content.entity").MarketingContent[]>;
    count(vendorId?: number): Promise<{
        total: number;
        growth: number;
        newThisMonth: number;
    }>;
    findAll(vendorId?: number, categoryId?: number, productId?: number, req?: any): Promise<import("./entities/marketing-content.entity").MarketingContent[]>;
    findOne(id: number, req?: any): Promise<import("./entities/marketing-content.entity").MarketingContent>;
    toggleSave(id: number, req: any): Promise<{
        saved: boolean;
        count: number;
    }>;
    incrementShare(id: number, req: any): Promise<void>;
    addComment(id: number, content: string, req: any): Promise<import("./interactions/interactions.entity").MarketingComment | null>;
    deleteComment(commentId: number, req: any): Promise<{
        success: boolean;
    }>;
}
