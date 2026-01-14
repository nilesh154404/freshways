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
exports.DeliverySlotsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_delivery_slot_dto_1 = require("./dto/create-delivery-slot.dto");
const update_delivery_slot_dto_1 = require("./dto/update-delivery-slot.dto");
const delivery_slot_entity_1 = require("./entities/delivery-slot.entity");
const delivery_slot_service_1 = require("./delivery-slot.service");
let DeliverySlotsController = class DeliverySlotsController {
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
        return this.service.findOne(+id);
    }
    findOneByVendorSubscriptionPlanId(id) {
        return this.service.findOneByVendorSubscriptionPlanId(+id);
    }
    update(id, dto) {
        return this.service.update(+id, dto);
    }
    remove(id) {
        return this.service.remove(+id);
    }
};
exports.DeliverySlotsController = DeliverySlotsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create delivery slot' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: delivery_slot_entity_1.DeliverySlot }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_delivery_slot_dto_1.CreateDeliverySlotDto]),
    __metadata("design:returntype", void 0)
], DeliverySlotsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all delivery slots' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [delivery_slot_entity_1.DeliverySlot] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DeliverySlotsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get delivery slot by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, type: delivery_slot_entity_1.DeliverySlot }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DeliverySlotsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('vendor-subscription-plan/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get delivery slot by VendorSubscriptionPlanId' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, type: delivery_slot_entity_1.DeliverySlot }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DeliverySlotsController.prototype, "findOneByVendorSubscriptionPlanId", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update delivery slot' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: delivery_slot_entity_1.DeliverySlot }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_delivery_slot_dto_1.UpdateDeliverySlotDto]),
    __metadata("design:returntype", void 0)
], DeliverySlotsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete delivery slot' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DeliverySlotsController.prototype, "remove", null);
exports.DeliverySlotsController = DeliverySlotsController = __decorate([
    (0, swagger_1.ApiTags)('Delivery Slots'),
    (0, common_1.Controller)('delivery-slots'),
    __metadata("design:paramtypes", [delivery_slot_service_1.DeliverySlotsService])
], DeliverySlotsController);
//# sourceMappingURL=delivery-slot.controller.js.map