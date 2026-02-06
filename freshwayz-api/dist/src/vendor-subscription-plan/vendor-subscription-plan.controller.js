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
exports.VendorSubscriptionPlanController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vendor_subscription_plan_service_1 = require("./vendor-subscription-plan.service");
const create_vendor_subscription_plan_dto_1 = require("./dto/create-vendor-subscription-plan.dto");
const update_vendor_subscription_plan_dto_1 = require("./dto/update-vendor-subscription-plan.dto");
let VendorSubscriptionPlanController = class VendorSubscriptionPlanController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll() {
        return this.service.findAll();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
    getPlanByVendor(vendorId) {
        return this.service.findByVendor(vendorId);
    }
};
exports.VendorSubscriptionPlanController = VendorSubscriptionPlanController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vendor_subscription_plan_dto_1.CreateVendorSubscriptionPlanDto]),
    __metadata("design:returntype", void 0)
], VendorSubscriptionPlanController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({ description: 'List of plans' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VendorSubscriptionPlanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ description: 'Plan details' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VendorSubscriptionPlanController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOkResponse)({ description: 'Updated successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_vendor_subscription_plan_dto_1.UpdateVendorSubscriptionPlanDto]),
    __metadata("design:returntype", void 0)
], VendorSubscriptionPlanController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOkResponse)({ description: 'Deleted successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VendorSubscriptionPlanController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('vendor/:vendorId'),
    (0, swagger_1.ApiOkResponse)({ description: 'Get plan of a vendor by vendorId' }),
    __param(0, (0, common_1.Param)('vendorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VendorSubscriptionPlanController.prototype, "getPlanByVendor", null);
exports.VendorSubscriptionPlanController = VendorSubscriptionPlanController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Subscription Plans'),
    (0, common_1.Controller)('vendor-subscription-plans'),
    __metadata("design:paramtypes", [vendor_subscription_plan_service_1.VendorSubscriptionPlanService])
], VendorSubscriptionPlanController);
//# sourceMappingURL=vendor-subscription-plan.controller.js.map