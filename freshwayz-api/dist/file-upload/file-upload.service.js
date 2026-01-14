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
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const file_upload_entity_1 = require("./entities/file-upload.entity");
const marketing_content_entity_1 = require("../marketing-content/entities/marketing-content.entity");
let FileUploadService = class FileUploadService {
    fileRepo;
    marketingRepo;
    constructor(fileRepo, marketingRepo) {
        this.fileRepo = fileRepo;
        this.marketingRepo = marketingRepo;
    }
    async saveFile(file, customerId, vendorId, orderId, marketingContentId, tenantId) {
        let marketingContent = null;
        if (marketingContentId) {
            marketingContent = await this.marketingRepo.findOne({
                where: { id: marketingContentId },
            });
            if (!marketingContent) {
                throw new common_1.NotFoundException('Marketing content not found');
            }
        }
        console.log(tenantId);
        const fileUpload = this.fileRepo.create({
            fileName: file.filename,
            fileUrl: `https://freshwayz.dexpertsystems.com/uploads/${file.filename}`,
            customerId,
            vendorId,
            orderId, tenantId,
            ...(marketingContent ? { marketingContent } : {}),
        });
        return await this.fileRepo.save(fileUpload);
    }
    async getFilesByCustomer(customerId) {
        const files = await this.fileRepo.find({
            where: { customerId },
        });
        return files.map(file => file.fileUrl);
    }
    async getFilesByVendor(vendorId) {
        const files = await this.fileRepo.find({
            where: { vendorId },
        });
        return files.map(file => file.fileUrl);
    }
    async getFilesByTen(tenantId) {
        const files = await this.fileRepo.find({
            where: { tenantId },
        });
        return files.map(file => file.fileUrl);
    }
    async getFilesByOrder(orderId) {
        const files = await this.fileRepo.find({
            where: { orderId },
        });
        return files.map(file => file.fileUrl);
    }
    findAll() {
        return `This action returns all fileUpload`;
    }
    findOne(id) {
        return `This action returns a #${id} fileUpload`;
    }
    update(id, updateFileUploadDto) {
        return `This action updates a #${id} fileUpload`;
    }
    remove(id) {
        return `This action removes a #${id} fileUpload`;
    }
    async saveFilesForMarketing(files, marketingContentId) {
        const marketingContent = await this.marketingRepo.findOne({
            where: { id: marketingContentId },
        });
        if (!marketingContent)
            throw new common_1.NotFoundException('Marketing content not found');
        const fileEntities = files.map((file) => this.fileRepo.create({
            fileName: file.filename,
            fileUrl: `http://192.168.1.36:3064/uploads/${file.filename}`,
            marketingContent,
        }));
        return this.fileRepo.save(fileEntities);
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_upload_entity_1.FileUpload)),
    __param(1, (0, typeorm_1.InjectRepository)(marketing_content_entity_1.MarketingContent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map