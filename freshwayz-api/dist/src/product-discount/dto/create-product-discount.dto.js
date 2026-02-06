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
exports.CreateProductDiscountDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const discount_type_enum_1 = require("../entities/discount-type.enum");
class CreateProductDiscountDto {
    type;
    value;
    buyQuantity;
    getQuantity;
    minCartQuantity;
    startDate;
    endDate;
    isActive;
    productId;
}
exports.CreateProductDiscountDto = CreateProductDiscountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: discount_type_enum_1.DiscountType, description: 'Type of discount' }),
    (0, class_validator_1.IsEnum)(discount_type_enum_1.DiscountType),
    __metadata("design:type", String)
], CreateProductDiscountDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount value for PERCENTAGE or FLAT' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductDiscountDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Buy quantity for BOGO offers' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductDiscountDto.prototype, "buyQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Get quantity for BOGO offers' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductDiscountDto.prototype, "getQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum quantity in cart to activate discount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateProductDiscountDto.prototype, "minCartQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount start date', type: String, format: 'date-time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateProductDiscountDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount end date', type: String, format: 'date-time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateProductDiscountDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is discount active', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductDiscountDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the product this discount applies to' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductDiscountDto.prototype, "productId", void 0);
//# sourceMappingURL=create-product-discount.dto.js.map