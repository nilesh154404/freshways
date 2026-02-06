import { Repository } from 'typeorm';
import { FileUpload } from './entities/file-upload.entity';
import { UpdateFileUploadDto } from './dto/update-file-upload.dto';
import { MarketingContent } from 'src/marketing-content/entities/marketing-content.entity';
export declare class FileUploadService {
    private readonly fileRepo;
    private readonly marketingRepo;
    constructor(fileRepo: Repository<FileUpload>, marketingRepo: Repository<MarketingContent>);
    saveFile(file: Express.Multer.File, customerId?: number, vendorId?: number, orderId?: number, marketingContentId?: number, tenantId?: number): Promise<FileUpload>;
    getFilesByCustomer(customerId: number): Promise<string[]>;
    getFilesByVendor(vendorId: number): Promise<string[]>;
    getFilesByTen(tenantId: number): Promise<string[]>;
    getFilesByOrder(orderId: number): Promise<string[]>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateFileUploadDto: UpdateFileUploadDto): string;
    remove(id: number): string;
    saveFilesForMarketing(files: Express.Multer.File[], marketingContentId: number): Promise<FileUpload[]>;
}
