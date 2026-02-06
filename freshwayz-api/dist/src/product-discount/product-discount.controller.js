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
exports.ProductDiscountController = void 0;
const common_1 = require("@nestjs/common");
const product_discount_service_1 = require("./product-discount.service");
const create_product_discount_dto_1 = require("./dto/create-product-discount.dto");
const update_product_discount_dto_1 = require("./dto/update-product-discount.dto");
let ProductDiscountController = class ProductDiscountController {
    productDiscountService;
    constructor(productDiscountService) {
        this.productDiscountService = productDiscountService;
    }
    create(createProductDiscountDto) {
        return this.productDiscountService.create(createProductDiscountDto);
    }
    findAll() {
        return this.productDiscountService.findAll();
    }
    findOne(id) {
        return this.productDiscountService.findOne(+id);
    }
    update(id, updateProductDiscountDto) {
        return this.productDiscountService.update(+id, updateProductDiscountDto);
    }
    remove(id) {
        return this.productDiscountService.remove(+id);
    }
};
exports.ProductDiscountController = ProductDiscountController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_discount_dto_1.CreateProductDiscountDto]),
    __metadata("design:returntype", void 0)
], ProductDiscountController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductDiscountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductDiscountController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_discount_dto_1.UpdateProductDiscountDto]),
    __metadata("design:returntype", void 0)
], ProductDiscountController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductDiscountController.prototype, "remove", null);
exports.ProductDiscountController = ProductDiscountController = __decorate([
    (0, common_1.Controller)('product-discount'),
    __metadata("design:paramtypes", [product_discount_service_1.ProductDiscountService])
], ProductDiscountController);
//# sourceMappingURL=product-discount.controller.js.map