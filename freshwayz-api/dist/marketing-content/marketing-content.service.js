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
exports.MarketingContentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const marketing_content_entity_1 = require("./entities/marketing-content.entity");
const file_upload_service_1 = require("../file-upload/file-upload.service");
let MarketingContentService = class MarketingContentService {
    marketingRepo;
    fileUploadService;
    constructor(marketingRepo, fileUploadService) {
        this.marketingRepo = marketingRepo;
        this.fileUploadService = fileUploadService;
    }
    async create(dto, files) {
        const content = new marketing_content_entity_1.MarketingContent();
        content.category = { id: dto.categoryId };
        if (dto.productId) {
            content.product = { id: dto.productId };
        }
        if (dto.vendorId) {
            content.vendor = { id: dto.vendorId };
        }
        content.description = dto.description;
        await this.marketingRepo.save(content);
        if (files?.length) {
            await this.fileUploadService.saveFilesForMarketing(files, content.id);
        }
        return this.marketingRepo.findOne({
            where: { id: content.id },
            relations: ['category', 'product', 'vendor', 'media'],
        });
    }
    findAll() {
        return this.marketingRepo.find({
            relations: ['media', 'products'], order: {
                id: 'DESC',
            }
        });
    }
    async findOne(id) {
        const content = await this.marketingRepo.findOne({
            where: { id },
            relations: ['media'],
        });
        if (!content)
            throw new common_1.NotFoundException('Marketing content not found');
        return content;
    }
    async update(id, dto, files) {
        const content = await this.marketingRepo.preload({ id, ...dto });
        if (!content)
            throw new common_1.NotFoundException('Marketing content not found');
        await this.marketingRepo.save(content);
        if (files?.length) {
            await this.fileUploadService.saveFilesForMarketing(files, content.id);
        }
        return this.findOne(content.id);
    }
    async remove(id) {
        const content = await this.findOne(id);
        return this.marketingRepo.remove(content);
    }
    async filter(filters) {
        const query = this.marketingRepo
            .createQueryBuilder('content')
            .leftJoinAndSelect('content.media', 'media')
            .leftJoinAndSelect('content.vendor', 'vendor')
            .leftJoinAndSelect('content.product', 'product');
        if (filters.vendorId) {
            query.andWhere('vendor.id = :vendorId', { vendorId: filters.vendorId });
        }
        if (filters.categoryId) {
            query.andWhere('category.id = :categoryId', { categoryId: filters.categoryId });
        }
        if (filters.productId) {
            query.andWhere('product.id = :productId', { productId: filters.productId });
        }
        query.orderBy('content.id', 'DESC');
        return query.getMany();
    }
};
exports.MarketingContentService = MarketingContentService;
exports.MarketingContentService = MarketingContentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(marketing_content_entity_1.MarketingContent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        file_upload_service_1.FileUploadService])
], MarketingContentService);
//# sourceMappingURL=marketing-content.service.js.map