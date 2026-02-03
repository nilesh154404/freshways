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
exports.MarketingComment = exports.MarketingShare = exports.MarketingSave = exports.MarketingLike = void 0;
const typeorm_1 = require("typeorm");
const marketing_content_entity_1 = require("../entities/marketing-content.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const customer_entity_1 = require("../../customer/entities/customer.entity");
let MarketingLike = class MarketingLike {
    id;
    user;
    customer;
    marketingContent;
    created_at;
};
exports.MarketingLike = MarketingLike;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MarketingLike.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MarketingLike.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], MarketingLike.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => marketing_content_entity_1.MarketingContent, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'marketing_content_id' }),
    __metadata("design:type", marketing_content_entity_1.MarketingContent)
], MarketingLike.prototype, "marketingContent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MarketingLike.prototype, "created_at", void 0);
exports.MarketingLike = MarketingLike = __decorate([
    (0, typeorm_1.Entity)('marketing_likes')
], MarketingLike);
let MarketingSave = class MarketingSave {
    id;
    user;
    customer;
    marketingContent;
    created_at;
};
exports.MarketingSave = MarketingSave;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MarketingSave.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MarketingSave.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], MarketingSave.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => marketing_content_entity_1.MarketingContent, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'marketing_content_id' }),
    __metadata("design:type", marketing_content_entity_1.MarketingContent)
], MarketingSave.prototype, "marketingContent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MarketingSave.prototype, "created_at", void 0);
exports.MarketingSave = MarketingSave = __decorate([
    (0, typeorm_1.Entity)('marketing_saves')
], MarketingSave);
let MarketingShare = class MarketingShare {
    id;
    user;
    customer;
    marketingContent;
    created_at;
};
exports.MarketingShare = MarketingShare;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MarketingShare.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MarketingShare.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], MarketingShare.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => marketing_content_entity_1.MarketingContent, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'marketing_content_id' }),
    __metadata("design:type", marketing_content_entity_1.MarketingContent)
], MarketingShare.prototype, "marketingContent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MarketingShare.prototype, "created_at", void 0);
exports.MarketingShare = MarketingShare = __decorate([
    (0, typeorm_1.Entity)('marketing_shares')
], MarketingShare);
let MarketingComment = class MarketingComment {
    id;
    content;
    user;
    customer;
    marketingContent;
    created_at;
};
exports.MarketingComment = MarketingComment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MarketingComment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], MarketingComment.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE', nullable: true, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MarketingComment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { onDelete: 'CASCADE', nullable: true, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], MarketingComment.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => marketing_content_entity_1.MarketingContent, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'marketing_content_id' }),
    __metadata("design:type", marketing_content_entity_1.MarketingContent)
], MarketingComment.prototype, "marketingContent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MarketingComment.prototype, "created_at", void 0);
exports.MarketingComment = MarketingComment = __decorate([
    (0, typeorm_1.Entity)('marketing_comments')
], MarketingComment);
//# sourceMappingURL=interactions.entity.js.map