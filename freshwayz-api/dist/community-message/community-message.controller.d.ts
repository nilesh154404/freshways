import { CommunityMessageService } from './community-message.service';
import { CreateCommunityMessageDto } from './dto/create-community-message.dto';
import { UpdateCommunityMessageDto } from './dto/update-community-message.dto';
import { JoinCommunityDto } from 'src/community/dto/join-community.dto';
import { CommunityService } from 'src/community/community.service';
export declare class CommunityMessageController {
    private readonly communityMessageService;
    private readonly communityService;
    constructor(communityMessageService: CommunityMessageService, communityService: CommunityService);
    join(communityId: number, body: JoinCommunityDto): Promise<{
        success: boolean;
        message: string;
        communityId: number;
        customerId: number;
    } | {
        success: boolean;
        communityId: number;
        customerId: number;
        message?: undefined;
    }>;
    getChats(communityId: number): Promise<import("./entities/community-message.entity").CommunityMessage[]>;
    send(communityId: number, body: CreateCommunityMessageDto): Promise<import("./entities/community-message.entity").CommunityMessage | null>;
    create(createCommunityMessageDto: CreateCommunityMessageDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateCommunityMessageDto: UpdateCommunityMessageDto): string;
    remove(id: string): string;
}
