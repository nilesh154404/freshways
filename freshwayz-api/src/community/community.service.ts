import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { paginate, paginateArray, PaginatedResponse } from 'src/helpers/pagination/pagination';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@Injectable()
export class CommunityService {
    constructor(
        @InjectRepository(Community)
        private communityRepo: Repository<Community>,
    ) { }

    // async joinCommunity(communityId: number, customerId: number) {

    //     await this.communityRepo.manager
    //         .createQueryBuilder()
    //         .relation(Community, "customers")
    //         .of(communityId)
    //         .add(customerId);

    //     return { success: true, communityId, customerId };
    // }
    async joinCommunity(communityId: number, customerId: number) {

        // check if relation already exists
        const exists = await this.communityRepo.manager
            .createQueryBuilder()
            .relation(Community, "customers")
            .of(communityId)
            .loadMany();

        const alreadyIn = exists.some(c => c.id === customerId);

        if (alreadyIn) {
            return {
                success: false,
                message: "Customer already in this community.",
                communityId,
                customerId
            };
        }

        // add relation if not exists
        await this.communityRepo.manager
            .createQueryBuilder()
            .relation(Community, "customers")
            .of(communityId)
            .add(customerId);

        return { success: true, communityId, customerId };
    }

    async getCommunityMembers(communityId: number, dto?: RangeDTO) {
        const members = await this.communityRepo.manager
            .createQueryBuilder()
            .relation(Community, 'customers')
            .of(communityId)
            .loadMany();

        return paginateArray(members, dto);
    }
    async getMemberCommunities(customerId: number, dto?: RangeDTO) {
        const communities = await this.communityRepo.manager
            .createQueryBuilder()
            .relation(Customer, 'communities')
            .of(customerId)
            .loadMany();

        return paginateArray(communities, dto);
    }



    async create(dto: CreateCommunityDto): Promise<Community> {
        const community = this.communityRepo.create(dto);
        return this.communityRepo.save(community);
    }

    async findAll(dto?: RangeDTO): Promise<PaginatedResponse<Community>> {
        const qb = this.communityRepo.createQueryBuilder('community')
            .orderBy('community.id', 'ASC');

        return paginate(qb, dto);
    }

    async findOne(id: number): Promise<Community> {
        const found = await this.communityRepo.findOne({ where: { id } });
        if (!found) throw new NotFoundException('Community not found');
        return found;
    }

    async update(id: number, dto: UpdateCommunityDto): Promise<Community> {
        const community = await this.findOne(id);
        Object.assign(community, dto);
        return this.communityRepo.save(community);
    }

    async remove(id: number): Promise<string> {
        await this.findOne(id);
        await this.communityRepo.delete(id);
        return "Community deleted successfully";
    }

    // 🔍 Search by slug OR name
    async search(keyword: string, dto?: RangeDTO): Promise<PaginatedResponse<Community>> {
        const qb = this.communityRepo.createQueryBuilder('community')
            .where('community.name ILIKE :keyword OR community.slug ILIKE :keyword', { keyword: `%${keyword}%` })
            .orderBy('community.id', 'ASC');

        return paginate(qb, dto);
    }
}
