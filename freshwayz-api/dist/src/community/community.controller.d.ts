import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
export declare class CommunityController {
    private readonly communityService;
    constructor(communityService: CommunityService);
    getCommunityMembers(communityId: number): Promise<{
        success: boolean;
        communityId: number;
        totalMembers: number;
        members: any[];
    }>;
    getMemberCommunities(customerId: number): Promise<{
        success: boolean;
        customerId: number;
        totalCommunities: number;
        communities: any[];
    }>;
    create(dto: CreateCommunityDto): Promise<import("./entities/community.entity").Community>;
    findAll(): Promise<import("./entities/community.entity").Community[]>;
    search(keyword: string): Promise<import("./entities/community.entity").Community[]>;
    findOne(id: string): Promise<import("./entities/community.entity").Community>;
    update(id: string, dto: UpdateCommunityDto): Promise<import("./entities/community.entity").Community>;
    remove(id: string): Promise<string>;
}
