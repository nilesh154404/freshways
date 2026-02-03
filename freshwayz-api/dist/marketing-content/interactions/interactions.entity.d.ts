import { MarketingContent } from '../entities/marketing-content.entity';
import { User } from '../../user/entities/user.entity';
import { Customer } from '../../customer/entities/customer.entity';
export declare class MarketingLike {
    id: number;
    user: User;
    customer: Customer;
    marketingContent: MarketingContent;
    created_at: Date;
}
export declare class MarketingSave {
    id: number;
    user: User;
    customer: Customer;
    marketingContent: MarketingContent;
    created_at: Date;
}
export declare class MarketingShare {
    id: number;
    user: User;
    customer: Customer;
    marketingContent: MarketingContent;
    created_at: Date;
}
export declare class MarketingComment {
    id: number;
    content: string;
    user: User;
    customer: Customer;
    marketingContent: MarketingContent;
    created_at: Date;
}
