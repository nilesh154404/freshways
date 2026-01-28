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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_order_dto_1 = require("./dto/create-order.dto");
const update_order_dto_1 = require("./dto/update-order.dto");
const order_entity_1 = require("./entities/order.entity");
const orders_service_1 = require("./orders.service");
const create_new_order_dto_1 = require("./dto/create-new-order.dto");
const update_order_status_dto_1 = require("./dto/update-order-status.dto");
let OrderController = class OrderController {
    orderService;
    constructor(orderService) {
        this.orderService = orderService;
    }
    createNew(createDto) {
        return this.orderService.createNew(createDto);
    }
    async updateStatus(id, dto) {
        return this.orderService.updateStatus(id, dto);
    }
    getOrdersByCustomerId(customerId) {
        return this.orderService.findByCustomerId(customerId);
    }
    create(createOrderDto) {
        return this.orderService.create(createOrderDto);
    }
    async findAll(customerId, vendorId, communityId, orderStatus, paymentStatus, startDate, endDate, deliveryDate) {
        return this.orderService.findAll({
            customerId,
            vendorId,
            communityId,
            orderStatus,
            paymentStatus,
            startDate,
            endDate,
            deliveryDate,
        });
    }
    findOne(id) {
        return this.orderService.findOne(+id);
    }
    findOneByVendorServicePlan(id, customerId) {
        return this.orderService.findOneByVendorServicePlan(id, customerId);
    }
    update(id, updateOrderDto) {
        return this.orderService.update(+id, updateOrderDto);
    }
    remove(id) {
        return this.orderService.remove(+id);
    }
    getOrdersByCustomer(customerId) {
        return this.orderService.getOrdersByCustomer(+customerId);
    }
    getOrdersByVendor(vendorId) {
        return this.orderService.getOrdersByVendor(+vendorId);
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new order with listed items' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Order created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_new_order_dto_1.CreateNewOrderDto]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "createNew", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_order_status_dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders for a specific customer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Orders retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No orders found for this customer' }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "getOrdersByCustomerId", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new order' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: order_entity_1.Order }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders with optional filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [order_entity_1.Order] }),
    __param(0, (0, common_1.Query)('customerId')),
    __param(1, (0, common_1.Query)('vendorId')),
    __param(2, (0, common_1.Query)('communityId')),
    __param(3, (0, common_1.Query)('orderStatus')),
    __param(4, (0, common_1.Query)('paymentStatus')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __param(7, (0, common_1.Query)('deliveryDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: order_entity_1.Order }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('vendor-service-plan/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order by vendor service plan ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: order_entity_1.Order }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('customerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "findOneByVendorServicePlan", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: order_entity_1.Order }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete order by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get orders by customer ID' }),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "getOrdersByCustomer", null);
__decorate([
    (0, common_1.Get)('vendor/:vendorId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get orders by vendor ID' }),
    __param(0, (0, common_1.Param)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "getOrdersByVendor", null);
exports.OrderController = OrderController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrderService])
], OrderController);
//# sourceMappingURL=orders.controller.js.map