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
exports.FileUploadController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const file_upload_service_1 = require("./file-upload.service");
const upload_file_dto_1 = require("./dto/upload-file.dto");
const multer_config_1 = require("./multer.config");
const file_upload_entity_1 = require("./entities/file-upload.entity");
let FileUploadController = class FileUploadController {
    fileService;
    constructor(fileService) {
        this.fileService = fileService;
    }
    async uploadFile(file, body) {
        console.log({
            d: body.customerId,
            b: body.vendorId,
            c: body.orderId, f: body.marketingContentId, t: body.tenantId
        });
        console.log('body:', body);
        console.log('type of tenantId:', typeof body.tenantId);
        return this.fileService.saveFile(file, body.customerId, body.vendorId, body.orderId, body.marketingContentId, body.tenantId);
    }
    async getFilesByCustomer(customerId) {
        return this.fileService.getFilesByCustomer(customerId);
    }
    async getFilesByVendor(vendorId) {
        return this.fileService.getFilesByVendor(vendorId);
    }
    async getFilesByTen(tenantId) {
        return this.fileService.getFilesByTen(tenantId);
    }
    async getFilesByOrder(orderId) {
        return this.fileService.getFilesByOrder(orderId);
    }
};
exports.FileUploadController = FileUploadController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                customerId: { type: 'number', example: 1 },
                vendorId: { type: 'number', example: 2 },
                orderId: { type: 'number', example: 2 },
                tenantId: { type: 'number', example: 2 },
                marketingContentId: { type: 'number', },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, type: file_upload_entity_1.FileUpload }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_config_1.multerConfig)),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_file_dto_1.UploadFileDto]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all file URLs by Customer ID' }),
    (0, swagger_1.ApiParam)({ name: 'customerId', type: Number, example: 1 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Array of file URLs',
        type: [String],
    }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getFilesByCustomer", null);
__decorate([
    (0, common_1.Get)('vendor/:vendorId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all file URLs by Vendor ID' }),
    (0, swagger_1.ApiParam)({ name: 'vendorId', type: Number, example: 5 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Array of file URLs',
        type: [String],
    }),
    __param(0, (0, common_1.Param)('vendorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getFilesByVendor", null);
__decorate([
    (0, common_1.Get)('msfc/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all file URLs by Vendor ID' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', type: Number, example: 5 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Array of file URLs',
        type: [String],
    }),
    __param(0, (0, common_1.Param)('tenantId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getFilesByTen", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all file URLs by Vendor ID' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', type: Number, example: 5 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Array of file URLs',
        type: [String],
    }),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getFilesByOrder", null);
exports.FileUploadController = FileUploadController = __decorate([
    (0, swagger_1.ApiTags)('File Upload'),
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [file_upload_service_1.FileUploadService])
], FileUploadController);
//# sourceMappingURL=file-upload.controller.js.map