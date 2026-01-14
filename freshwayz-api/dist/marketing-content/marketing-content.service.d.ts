import { Repository } from 'typeorm';
import { MarketingContent } from './entities/marketing-content.entity';
import { CreateMarketingContentDto } from './dto/create-marketing-content.dto';
import { UpdateMarketingContentDto } from './dto/update-marketing-content.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
export declare class MarketingContentService {
    private readonly marketingRepo;
    private readonly fileUploadService;
    constructor(marketingRepo: Repository<MarketingContent>, fileUploadService: FileUploadService);
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
}
