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
exports.DeliverySlot = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const order_entity_1 = require("../../orders/entities/order.entity");
const vendor_subscription_plan_entity_1 = require("../../vendor-subscription-plan/entities/vendor-subscription-plan.entity");
let DeliverySlot = class DeliverySlot {
    id;
    date;
    startTime;
    endTime;
    capacity;
    isActive;
    vendorSubscriptionPlan;
    orders;
    createdAt;
    updatedAt;
};
exports.DeliverySlot = DeliverySlot;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DeliverySlot.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-01' }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], DeliverySlot.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10:00' }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DeliverySlot.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12:00' }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DeliverySlot.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20 }),
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], DeliverySlot.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], DeliverySlot.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_subscription_plan_entity_1.VendorSubscriptionPlan, vendorSubscriptionPlan => vendorSubscriptionPlan.deliverySlot),
    (0, typeorm_1.JoinColumn)({ name: 'vendorSubscriptionPlanId' }),
    __metadata("design:type", vendor_subscription_plan_entity_1.VendorSubscriptionPlan)
], DeliverySlot.prototype, "vendorSubscriptionPlan", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, order => order.vendor),
    __metadata("design:type", Array)
], DeliverySlot.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DeliverySlot.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DeliverySlot.prototype, "updatedAt", void 0);
exports.DeliverySlot = DeliverySlot = __decorate([
    (0, typeorm_1.Entity)('delivery_slots')
], DeliverySlot);
//# sourceMappingURL=delivery-slot.entity.js.map