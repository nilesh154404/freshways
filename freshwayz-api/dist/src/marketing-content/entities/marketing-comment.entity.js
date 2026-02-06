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
exports.MarketingComment = void 0;
const typeorm_1 = require("typeorm");
const marketing_content_entity_1 = require("./marketing-content.entity");
let MarketingComment = class MarketingComment {
    id;
    userId;
    userType;
    text;
    marketingContent;
    createdAt;
};
exports.MarketingComment = MarketingComment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MarketingComment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MarketingComment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MarketingComment.prototype, "userType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MarketingComment.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => marketing_content_entity_1.MarketingContent, (content) => content.comments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'marketing_content_id' }),
    __metadata("design:type", marketing_content_entity_1.MarketingContent)
], MarketingComment.prototype, "marketingContent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MarketingComment.prototype, "createdAt", void 0);
exports.MarketingComment = MarketingComment = __decorate([
    (0, typeorm_1.Entity)('marketing_comments')
], MarketingComment);
//# sourceMappingURL=marketing-comment.entity.js.map