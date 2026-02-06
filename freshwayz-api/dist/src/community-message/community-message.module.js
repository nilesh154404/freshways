"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityMessageModule = void 0;
const common_1 = require("@nestjs/common");
const community_message_service_1 = require("./community-message.service");
const community_message_controller_1 = require("./community-message.controller");
const typeorm_1 = require("@nestjs/typeorm");
const community_message_entity_1 = require("./entities/community-message.entity");
const community_chat_gateway_1 = require("./community-chat.gateway");
const community_service_1 = require("../community/community.service");
const community_entity_1 = require("../community/entities/community.entity");
let CommunityMessageModule = class CommunityMessageModule {
};
exports.CommunityMessageModule = CommunityMessageModule;
exports.CommunityMessageModule = CommunityMessageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([community_message_entity_1.CommunityMessage, community_entity_1.Community]),
        ],
        controllers: [community_message_controller_1.CommunityMessageController],
        providers: [community_message_service_1.CommunityMessageService, community_chat_gateway_1.CommunityChatGateway, community_service_1.CommunityService],
    })
], CommunityMessageModule);
//# sourceMappingURL=community-message.module.js.map