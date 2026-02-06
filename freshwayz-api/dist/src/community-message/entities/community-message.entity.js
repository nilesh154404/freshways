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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityMessage = void 0;
const typeorm_1 = require("typeorm");
const community_entity_1 = require("../../community/entities/community.entity");
const customer_entity_1 = require("../../customer/entities/customer.entity");
let CommunityMessage = class CommunityMessage {
    id;
    message;
    community;
    sender;
    createdAt;
};
exports.CommunityMessage = CommunityMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CommunityMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CommunityMessage.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => community_entity_1.Community, community => community.id),
    __metadata("design:type", community_entity_1.Community)
], CommunityMessage.prototype, "community", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, customer => customer.id),
    __metadata("design:type", customer_entity_1.Customer)
], CommunityMessage.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CommunityMessage.prototype, "createdAt", void 0);
exports.CommunityMessage = CommunityMessage = __decorate([
    (0, typeorm_1.Entity)()
], CommunityMessage);
//# sourceMappingURL=community-message.entity.js.map