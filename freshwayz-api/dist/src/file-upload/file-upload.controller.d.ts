import { FileUploadService } from './file-upload.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileUpload } from './entities/file-upload.entity';
export declare class FileUploadController {
    private readonly fileService;
    constructor(fileService: FileUploadService);
    uploadFile(file: Express.Multer.File, body: UploadFileDto): Promise<FileUpload>;
    getFilesByCustomer(customerId: number): Promise<string[]>;
    getFilesByVendor(vendorId: number): Promise<string[]>;
    getFilesByTen(tenantId: number): Promise<string[]>;
    getFilesByOrder(orderId: number): Promise<string[]>;
}
