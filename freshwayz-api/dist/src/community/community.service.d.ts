import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
export declare class CommunityService {
    private communityRepo;
    constructor(communityRepo: Repository<Community>);
    joinCommunity(communityId: number, customerId: number): Promise<{
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
    create(dto: CreateCommunityDto): Promise<Community>;
    findAll(): Promise<Community[]>;
    findOne(id: number): Promise<Community>;
    update(id: number, dto: UpdateCommunityDto): Promise<Community>;
    remove(id: number): Promise<string>;
    search(keyword: string): Promise<Community[]>;
}
