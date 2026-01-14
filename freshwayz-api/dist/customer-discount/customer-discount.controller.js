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
exports.CustomerDiscountController = void 0;
const common_1 = require("@nestjs/common");
const customer_discount_service_1 = require("./customer-discount.service");
const create_customer_discount_dto_1 = require("./dto/create-customer-discount.dto");
const update_customer_discount_dto_1 = require("./dto/update-customer-discount.dto");
let CustomerDiscountController = class CustomerDiscountController {
    customerDiscountService;
    constructor(customerDiscountService) {
        this.customerDiscountService = customerDiscountService;
    }
    create(createCustomerDiscountDto) {
        return this.customerDiscountService.create(createCustomerDiscountDto);
    }
    findAll() {
        return this.customerDiscountService.findAll();
    }
    findOne(id) {
        return this.customerDiscountService.findOne(+id);
    }
    update(id, updateCustomerDiscountDto) {
        return this.customerDiscountService.update(+id, updateCustomerDiscountDto);
    }
    remove(id) {
        return this.customerDiscountService.remove(+id);
    }
};
exports.CustomerDiscountController = CustomerDiscountController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_discount_dto_1.CreateCustomerDiscountDto]),
    __metadata("design:returntype", void 0)
], CustomerDiscountController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerDiscountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerDiscountController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_discount_dto_1.UpdateCustomerDiscountDto]),
    __metadata("design:returntype", void 0)
], CustomerDiscountController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerDiscountController.prototype, "remove", null);
exports.CustomerDiscountController = CustomerDiscountController = __decorate([
    (0, common_1.Controller)('customer-discount'),
    __metadata("design:paramtypes", [customer_discount_service_1.CustomerDiscountService])
], CustomerDiscountController);
//# sourceMappingURL=customer-discount.controller.js.map