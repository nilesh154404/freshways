import { Community } from "src/community/entities/community.entity";
import { Customer } from "src/customer/entities/customer.entity";
export declare class CommunityMessage {
    id: number;
    message: string;
    community: Community;
    sender: Customer;
    createdAt: Date;
}
