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
exports.CreateNewOrderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateNewOrderDto {
    customerId;
    vendorId;
    communityId;
    deliveryDate;
    deliverySlotId;
    vendorSubscriptionPlanId;
    grandTotal;
    listedOrders;
}
exports.CreateNewOrderDto = CreateNewOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID placing the order' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateNewOrderDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vendor ID for the order, optional' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateNewOrderDto.prototype, "vendorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Community ID for the order' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateNewOrderDto.prototype, "communityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Delivery date of the order' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateNewOrderDto.prototype, "deliveryDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateNewOrderDto.prototype, "deliverySlotId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateNewOrderDto.prototype, "vendorSubscriptionPlanId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Grand total of the order', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateNewOrderDto.prototype, "grandTotal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Listed Orders', type: [Object] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateNewOrderDto.prototype, "listedOrders", void 0);
//# sourceMappingURL=create-new-order.dto.js.map