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
exports.MarketingContentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const marketing_content_service_1 = require("./marketing-content.service");
const update_marketing_content_dto_1 = require("./dto/update-marketing-content.dto");
const multer_config_1 = require("./multer.config");
let MarketingContentController = class MarketingContentController {
    marketingService;
    constructor(marketingService) {
        this.marketingService = marketingService;
    }
    async create(dto, files) {
        const data = {
            ...dto,
            categoryId: Number(dto.categoryId),
            productId: dto.productId ? Number(dto.productId) : undefined,
            vendorId: dto.vendorId ? Number(dto.vendorId) : undefined,
        };
        return this.marketingService.create(data, files?.media_files);
    }
    async findAll(vendorId, categoryId, productId) {
        if (vendorId || categoryId || productId) {
            return this.marketingService.filter({ vendorId, categoryId, productId });
        }
        return this.marketingService.findAll();
    }
    async findOne(id) {
        return this.marketingService.findOne(id);
    }
    async update(id, dto, files) {
        return this.marketingService.update(id, dto, files?.media_files);
    }
    async remove(id) {
        return this.marketingService.remove(id);
    }
    async toggleSave(id, body) {
        return this.marketingService.toggleSave(id, body.userId, body.userType || 'Customer');
    }
    async addComment(id, body) {
        return this.marketingService.addComment(id, body.text, body.userId, body.userType || 'Customer');
    }
    async deleteComment(commentId) {
        return this.marketingService.deleteComment(commentId);
    }
    async sharePost(id) {
        const deepLink = await this.marketingService.incrementShare(id);
        return { deepLink };
    }
    async getSavedPosts(userId) {
        return this.marketingService.getSavedPosts(userId);
    }
};
exports.MarketingContentController = MarketingContentController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'media_files', maxCount: 10 }], multer_config_1.multerConfig)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('vendorId')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'media_files', maxCount: 10 }])),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_marketing_content_dto_1.UpdateMarketingContentDto, Object]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/save'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "toggleSave", null);
__decorate([
    (0, common_1.Post)(':id/comment'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                text: { type: 'string', example: 'Great post!' },
                userId: { type: 'number', example: 1 },
                userType: { type: 'string', example: 'Customer' },
            },
            required: ['text', 'userId'],
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "addComment", null);
__decorate([
    (0, common_1.Delete)('comment/:commentId'),
    __param(0, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "sharePost", null);
__decorate([
    (0, common_1.Get)('user/:userId/saved'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "getSavedPosts", null);
exports.MarketingContentController = MarketingContentController = __decorate([
    (0, swagger_1.ApiTags)('Marketing Content'),
    (0, common_1.Controller)('marketing'),
    __metadata("design:paramtypes", [marketing_content_service_1.MarketingContentService])
], MarketingContentController);
//# sourceMappingURL=marketing-content.controller.js.map