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
const multer_config_1 = require("./multer.config");
const optional_jwt_auth_guard_1 = require("../auth/guards/optional-jwt-auth.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
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
    async getSavedPosts(req) {
        const userId = req.user.profileId || req.user.sub;
        const role = req.user.role;
        return this.marketingService.getSavedPosts(userId, role);
    }
    async count(vendorId) {
        return this.marketingService.count({ vendorId });
    }
    async findAll(vendorId, categoryId, productId, req) {
        if (vendorId || categoryId || productId) {
            return this.marketingService.filter({ vendorId, categoryId, productId });
        }
        const userId = req?.user?.profileId || req?.user?.sub;
        const role = req?.user?.role;
        return this.marketingService.findAll(userId, role);
    }
    async findOne(id, req) {
        const userId = req?.user?.profileId || req?.user?.sub;
        const role = req?.user?.role;
        return this.marketingService.findOne(id, userId, role);
    }
    async toggleSave(id, req) {
        const userId = req.user.profileId || req.user.sub;
        return this.marketingService.toggleSave(userId, id, req.user.role);
    }
    async incrementShare(id, req) {
        const userId = req.user?.profileId || req.user?.sub;
        return this.marketingService.incrementShare(id, userId, req.user?.role);
    }
    async addComment(id, content, req) {
        const userId = req.user.profileId || req.user.sub;
        return this.marketingService.addComment(userId, id, req.user.role, content);
    }
    async deleteComment(commentId, req) {
        const role = req.user.role;
        if (role !== 'Admin' && role !== 'Vendor') {
            throw new common_1.ForbiddenException('Only Admins and Vendors can delete comments');
        }
        return this.marketingService.deleteComment(commentId);
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('saved'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "getSavedPosts", null);
__decorate([
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Get)('count'),
    __param(0, (0, common_1.Query)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "count", null);
__decorate([
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('vendorId')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('productId')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':id/save'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "toggleSave", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "incrementShare", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "addComment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('comments/:commentId'),
    __param(0, (0, common_1.Param)('commentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MarketingContentController.prototype, "deleteComment", null);
exports.MarketingContentController = MarketingContentController = __decorate([
    (0, swagger_1.ApiTags)('Marketing Content'),
    (0, common_1.Controller)('marketing'),
    __metadata("design:paramtypes", [marketing_content_service_1.MarketingContentService])
], MarketingContentController);
//# sourceMappingURL=marketing-content.controller.js.map