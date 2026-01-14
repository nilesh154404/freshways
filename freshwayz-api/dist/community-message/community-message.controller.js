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
exports.CommunityMessageController = void 0;
const common_1 = require("@nestjs/common");
const community_message_service_1 = require("./community-message.service");
const create_community_message_dto_1 = require("./dto/create-community-message.dto");
const update_community_message_dto_1 = require("./dto/update-community-message.dto");
const swagger_1 = require("@nestjs/swagger");
const join_community_dto_1 = require("../community/dto/join-community.dto");
const community_service_1 = require("../community/community.service");
let CommunityMessageController = class CommunityMessageController {
    communityMessageService;
    communityService;
    constructor(communityMessageService, communityService) {
        this.communityMessageService = communityMessageService;
        this.communityService = communityService;
    }
    async join(communityId, body) {
        return this.communityService.joinCommunity(communityId, body.customerId);
    }
    async getChats(communityId) {
        return await this.communityMessageService.getMessages(communityId);
    }
    async send(communityId, body) {
        return await this.communityMessageService.sendMessage(body.customerId, communityId, body.message);
    }
    create(createCommunityMessageDto) {
        return this.communityMessageService.create(createCommunityMessageDto);
    }
    findAll() {
        return this.communityMessageService.findAll();
    }
    findOne(id) {
        return this.communityMessageService.findOne(+id);
    }
    update(id, updateCommunityMessageDto) {
        return this.communityMessageService.update(+id, updateCommunityMessageDto);
    }
    remove(id) {
        return this.communityMessageService.remove(+id);
    }
};
exports.CommunityMessageController = CommunityMessageController;
__decorate([
    (0, common_1.Post)(":communityId/join"),
    __param(0, (0, common_1.Param)("communityId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, join_community_dto_1.JoinCommunityDto]),
    __metadata("design:returntype", Promise)
], CommunityMessageController.prototype, "join", null);
__decorate([
    (0, common_1.Get)(":communityId/chats"),
    __param(0, (0, common_1.Param)("communityId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CommunityMessageController.prototype, "getChats", null);
__decorate([
    (0, common_1.Post)(":communityId/chat"),
    __param(0, (0, common_1.Param)("communityId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_community_message_dto_1.CreateCommunityMessageDto]),
    __metadata("design:returntype", Promise)
], CommunityMessageController.prototype, "send", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_community_message_dto_1.CreateCommunityMessageDto]),
    __metadata("design:returntype", void 0)
], CommunityMessageController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommunityMessageController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunityMessageController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_community_message_dto_1.UpdateCommunityMessageDto]),
    __metadata("design:returntype", void 0)
], CommunityMessageController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunityMessageController.prototype, "remove", null);
exports.CommunityMessageController = CommunityMessageController = __decorate([
    (0, swagger_1.ApiTags)('CommunityChats'),
    (0, common_1.Controller)('community-message'),
    __metadata("design:paramtypes", [community_message_service_1.CommunityMessageService,
        community_service_1.CommunityService])
], CommunityMessageController);
//# sourceMappingURL=community-message.controller.js.map