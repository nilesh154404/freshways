import { MarketingContent } from 'src/marketing-content/entities/marketing-content.entity';
export declare class FileUpload {
    id: number;
    fileName: string;
    fileUrl: string;
    marketingContentId?: number;
    marketingContent?: MarketingContent;
    customerId?: number;
    tenantId?: number;
    vendorId?: number;
    orderId?: number;
    createdAt: Date;
}
