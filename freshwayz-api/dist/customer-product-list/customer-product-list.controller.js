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
exports.CustomerProductListController = void 0;
const common_1 = require("@nestjs/common");
const customer_product_list_service_1 = require("./customer-product-list.service");
const create_customer_product_dto_1 = require("./dto/create-customer-product.dto");
let CustomerProductListController = class CustomerProductListController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        return this.service.create(dto);
    }
    getByCustomer(customerId) {
        return this.service.getByCustomerId(+customerId);
    }
    delete(id) {
        return this.service.deleteById(+id);
    }
};
exports.CustomerProductListController = CustomerProductListController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_product_dto_1.CreateCustomerProductDto]),
    __metadata("design:returntype", Promise)
], CustomerProductListController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CustomerProductListController.prototype, "getByCustomer", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CustomerProductListController.prototype, "delete", null);
exports.CustomerProductListController = CustomerProductListController = __decorate([
    (0, common_1.Controller)('customer-product-list'),
    __metadata("design:paramtypes", [customer_product_list_service_1.CustomerProductListService])
], CustomerProductListController);
//# sourceMappingURL=customer-product-list.controller.js.map