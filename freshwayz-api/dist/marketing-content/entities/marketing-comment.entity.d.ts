import { MarketingContent } from './marketing-content.entity';
export declare class MarketingComment {
    id: number;
    userId: number;
    userType: string;
    text: string;
    marketingContent: MarketingContent;
    createdAt: Date;
}
