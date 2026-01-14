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
exports.ListedOrderController = void 0;
const common_1 = require("@nestjs/common");
const listed_order_service_1 = require("./listed-order.service");
const create_listed_order_dto_1 = require("./dto/create-listed-order.dto");
const update_listed_order_dto_1 = require("./dto/update-listed-order.dto");
const swagger_1 = require("@nestjs/swagger");
const listed_order_entity_1 = require("./entities/listed-order.entity");
let ListedOrderController = class ListedOrderController {
    listedOrdersService;
    constructor(listedOrdersService) {
        this.listedOrdersService = listedOrdersService;
    }
    findAll() {
        return this.listedOrdersService.findAll();
    }
    findOne(id) {
        return this.listedOrdersService.findOne(id);
    }
    create(dto) {
        return this.listedOrdersService.create(dto);
    }
    update(id, dto) {
        return this.listedOrdersService.update(id, dto);
    }
    remove(id) {
        return this.listedOrdersService.remove(id);
    }
};
exports.ListedOrderController = ListedOrderController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({ type: [listed_order_entity_1.ListedOrder] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ListedOrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: listed_order_entity_1.ListedOrder }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ListedOrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiCreatedResponse)({ type: listed_order_entity_1.ListedOrder }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_listed_order_dto_1.CreateListedOrderDto]),
    __metadata("design:returntype", void 0)
], ListedOrderController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: listed_order_entity_1.ListedOrder }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_listed_order_dto_1.UpdateListedOrderDto]),
    __metadata("design:returntype", void 0)
], ListedOrderController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOkResponse)({ description: 'Deleted successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ListedOrderController.prototype, "remove", null);
exports.ListedOrderController = ListedOrderController = __decorate([
    (0, swagger_1.ApiTags)('listed-orders'),
    (0, common_1.Controller)('listed-orders'),
    __metadata("design:paramtypes", [listed_order_service_1.ListedOrderService])
], ListedOrderController);
//# sourceMappingURL=listed-order.controller.js.map