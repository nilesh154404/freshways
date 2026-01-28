import { User } from 'src/user/entities/user.entity';
import { MarketingContent } from './marketing-content.entity';
export declare class MarketingLike {
    id: number;
    user: User;
    marketingContent: MarketingContent;
    createdAt: Date;
}
