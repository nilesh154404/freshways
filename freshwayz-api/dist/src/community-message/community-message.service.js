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
exports.CommunityMessageService = void 0;
const common_1 = require("@nestjs/common");
const community_message_entity_1 = require("./entities/community-message.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const community_entity_1 = require("../community/entities/community.entity");
let CommunityMessageService = class CommunityMessageService {
    messageRepo;
    constructor(messageRepo) {
        this.messageRepo = messageRepo;
    }
    async joinCommunity(communityId, customerId) {
        await this.messageRepo.manager
            .createQueryBuilder()
            .relation(community_entity_1.Community, 'customers')
            .of(communityId)
            .add(customerId);
        return {
            status: true,
            message: 'Community joined successfully',
            communityId,
            customerId,
        };
    }
    async sendMessage(customerId, communityId, message) {
        const exists = await this.messageRepo.manager.query(`SELECT 1 FROM community_customers_customer 
      WHERE customerId = ? AND communityId = ? LIMIT 1`, [customerId, communityId]);
        if (!exists.length) {
            throw new common_1.ForbiddenException('User must join community first');
        }
        const msg = this.messageRepo.create({
            message,
            community: { id: communityId },
            sender: { id: customerId },
        });
        const saved = await this.messageRepo.save(msg);
        return await this.getSingleMessage(saved.id);
    }
    async getSingleMessage(messageId) {
        return this.messageRepo.findOne({
            where: { id: messageId },
            relations: ['sender'],
            select: {
                id: true,
                message: true,
                createdAt: true,
                sender: {
                    id: true,
                    fullName: true,
                },
            },
        });
    }
    async getMessages(communityId) {
        return await this.messageRepo.find({
            where: { community: { id: communityId } },
            relations: ['sender'],
            select: {
                id: true,
                message: true,
                createdAt: true,
                sender: {
                    id: true,
                    fullName: true,
                },
            },
            order: { createdAt: 'ASC' },
        });
    }
    create(dto) {
        return 'disabled';
    }
    findAll() {
        return 'disabled';
    }
    findOne(id) {
        return 'disabled';
    }
    update(id, dto) {
        return 'disabled';
    }
    remove(id) {
        return 'disabled';
    }
};
exports.CommunityMessageService = CommunityMessageService;
exports.CommunityMessageService = CommunityMessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(community_message_entity_1.CommunityMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CommunityMessageService);
//# sourceMappingURL=community-message.service.js.map