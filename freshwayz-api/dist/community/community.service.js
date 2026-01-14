"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const community_entity_1 = require("./entities/community.entity");
const customer_entity_1 = require("../customer/entities/customer.entity");
let CommunityService = class CommunityService {
    communityRepo;
    constructor(communityRepo) {
        this.communityRepo = communityRepo;
    }
    async joinCommunity(communityId, customerId) {
        const exists = await this.communityRepo.manager
            .createQueryBuilder()
            .relation(community_entity_1.Community, "customers")
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
        await this.communityRepo.manager
            .createQueryBuilder()
            .relation(community_entity_1.Community, "customers")
            .of(communityId)
            .add(customerId);
        return { success: true, communityId, customerId };
    }
    async getCommunityMembers(communityId) {
        const members = await this.communityRepo.manager
            .createQueryBuilder()
            .relation(community_entity_1.Community, 'customers')
            .of(communityId)
            .loadMany();
        return {
            success: true,
            communityId,
            totalMembers: members.length,
            members,
        };
    }
    async getMemberCommunities(customerId) {
        const communities = await this.communityRepo.manager
            .createQueryBuilder()
            .relation(customer_entity_1.Customer, 'communities')
            .of(customerId)
            .loadMany();
        return {
            success: true,
            customerId,
            totalCommunities: communities.length,
            communities,
        };
    }
    async create(dto) {
        const community = this.communityRepo.create(dto);
        return this.communityRepo.save(community);
    }
    async findAll() {
        return this.communityRepo.find();
    }
    async findOne(id) {
        const found = await this.communityRepo.findOne({ where: { id } });
        if (!found)
            throw new common_1.NotFoundException('Community not found');
        return found;
    }
    async update(id, dto) {
        const community = await this.findOne(id);
        Object.assign(community, dto);
        return this.communityRepo.save(community);
    }
    async remove(id) {
        await this.findOne(id);
        await this.communityRepo.delete(id);
        return "Community deleted successfully";
    }
    async search(keyword) {
        return this.communityRepo.find({
            where: [
                { name: (0, typeorm_2.ILike)(`%${keyword}%`) },
                { slug: (0, typeorm_2.ILike)(`%${keyword}%`) }
            ]
        });
    }
};
exports.CommunityService = CommunityService;
exports.CommunityService = CommunityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(community_entity_1.Community)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CommunityService);
//# sourceMappingURL=community.service.js.map