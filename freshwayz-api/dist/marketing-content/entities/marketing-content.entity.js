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
exports.MarketingContent = void 0;
const categories_entity_1 = require("../../categories/categories.entity");
const file_upload_entity_1 = require("../../file-upload/entities/file-upload.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const vendor_entity_1 = require("../../vendor/entities/vendor.entity");
const typeorm_1 = require("typeorm");
let MarketingContent = class MarketingContent {
    id;
    category;
    product;
    vendor;
    description;
    media;
};
exports.MarketingContent = MarketingContent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MarketingContent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => categories_entity_1.Categories, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "category", referencedColumnName: "id" }),
    __metadata("design:type", categories_entity_1.Categories)
], MarketingContent.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], MarketingContent.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", vendor_entity_1.Vendor)
], MarketingContent.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketingContent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => file_upload_entity_1.FileUpload, (file) => file.marketingContent),
    __metadata("design:type", Array)
], MarketingContent.prototype, "media", void 0);
exports.MarketingContent = MarketingContent = __decorate([
    (0, typeorm_1.Entity)('marketing_contents')
], MarketingContent);
//# sourceMappingURL=marketing-content.entity.js.map