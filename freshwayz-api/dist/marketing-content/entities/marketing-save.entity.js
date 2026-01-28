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
exports.MarketingSave = void 0;
const typeorm_1 = require("typeorm");
const marketing_content_entity_1 = require("./marketing-content.entity");
let MarketingSave = class MarketingSave {
    id;
    userId;
    userType;
    marketingContent;
    createdAt;
};
exports.MarketingSave = MarketingSave;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MarketingSave.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MarketingSave.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MarketingSave.prototype, "userType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => marketing_content_entity_1.MarketingContent, (marketing) => marketing.saves, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'marketing_content_id' }),
    __metadata("design:type", marketing_content_entity_1.MarketingContent)
], MarketingSave.prototype, "marketingContent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MarketingSave.prototype, "createdAt", void 0);
exports.MarketingSave = MarketingSave = __decorate([
    (0, typeorm_1.Entity)('marketing_saves')
], MarketingSave);
//# sourceMappingURL=marketing-save.entity.js.map