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
exports.OrderReturnController = void 0;
const common_1 = require("@nestjs/common");
const order_return_service_1 = require("./order-return.service");
const create_order_return_dto_1 = require("./dto/create-order-return.dto");
const update_order_return_dto_1 = require("./dto/update-order-return.dto");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
let OrderReturnController = class OrderReturnController {
    orderReturnService;
    constructor(orderReturnService) {
        this.orderReturnService = orderReturnService;
    }
    create(createOrderReturnDto) {
        return this.orderReturnService.create(createOrderReturnDto);
    }
    findAll() {
        return this.orderReturnService.findAll();
    }
    findOne(id) {
        return this.orderReturnService.findOne(+id);
    }
    update(id, updateOrderReturnDto) {
        return this.orderReturnService.update(+id, updateOrderReturnDto);
    }
    remove(id) {
        return this.orderReturnService.remove(+id);
    }
};
exports.OrderReturnController = OrderReturnController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_return_dto_1.CreateOrderReturnDto]),
    __metadata("design:returntype", void 0)
], OrderReturnController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrderReturnController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderReturnController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_return_dto_1.UpdateOrderReturnDto]),
    __metadata("design:returntype", void 0)
], OrderReturnController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderReturnController.prototype, "remove", null);
exports.OrderReturnController = OrderReturnController = __decorate([
    (0, common_1.Controller)('order-return'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [order_return_service_1.OrderReturnService])
], OrderReturnController);
//# sourceMappingURL=order-return.controller.js.map