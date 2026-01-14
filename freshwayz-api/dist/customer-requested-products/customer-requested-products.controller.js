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
exports.CustomerRequestedProductsController = void 0;
const common_1 = require("@nestjs/common");
const customer_requested_products_service_1 = require("./customer-requested-products.service");
const create_customer_requested_product_dto_1 = require("./dto/create-customer-requested-product.dto");
const update_customer_requested_product_dto_1 = require("./dto/update-customer-requested-product.dto");
let CustomerRequestedProductsController = class CustomerRequestedProductsController {
    customerRequestedProductsService;
    constructor(customerRequestedProductsService) {
        this.customerRequestedProductsService = customerRequestedProductsService;
    }
    create(createCustomerRequestedProductDto) {
        return this.customerRequestedProductsService.create(createCustomerRequestedProductDto);
    }
    findAll() {
        return this.customerRequestedProductsService.findAll();
    }
    findOne(id) {
        return this.customerRequestedProductsService.findOne(+id);
    }
    update(id, updateCustomerRequestedProductDto) {
        return this.customerRequestedProductsService.update(+id, updateCustomerRequestedProductDto);
    }
    remove(id) {
        return this.customerRequestedProductsService.remove(+id);
    }
};
exports.CustomerRequestedProductsController = CustomerRequestedProductsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_requested_product_dto_1.CreateCustomerRequestedProductDto]),
    __metadata("design:returntype", void 0)
], CustomerRequestedProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerRequestedProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerRequestedProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_requested_product_dto_1.UpdateCustomerRequestedProductDto]),
    __metadata("design:returntype", void 0)
], CustomerRequestedProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerRequestedProductsController.prototype, "remove", null);
exports.CustomerRequestedProductsController = CustomerRequestedProductsController = __decorate([
    (0, common_1.Controller)('customer-requested-products'),
    __metadata("design:paramtypes", [customer_requested_products_service_1.CustomerRequestedProductsService])
], CustomerRequestedProductsController);
//# sourceMappingURL=customer-requested-products.controller.js.map