import { CreateCommunityMessageDto } from './dto/create-community-message.dto';
import { UpdateCommunityMessageDto } from './dto/update-community-message.dto';
import { CommunityMessage } from './entities/community-message.entity';
import { Repository } from 'typeorm';
export declare class CommunityMessageService {
    private readonly messageRepo;
    constructor(messageRepo: Repository<CommunityMessage>);
    joinCommunity(communityId: number, customerId: number): Promise<{
        status: boolean;
        message: string;
        communityId: number;
        customerId: number;
    }>;
    sendMessage(customerId: number, communityId: number, message: string): Promise<CommunityMessage | null>;
    getSingleMessage(messageId: number): Promise<CommunityMessage | null>;
    getMessages(communityId: number): Promise<CommunityMessage[]>;
    create(dto: CreateCommunityMessageDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, dto: UpdateCommunityMessageDto): string;
    remove(id: number): string;
}
