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
exports.Order = void 0;
const typeorm_1 = require("typeorm");
const customer_entity_1 = require("../../customer/entities/customer.entity");
const vendor_entity_1 = require("../../vendor/entities/vendor.entity");
const community_entity_1 = require("../../community/entities/community.entity");
const listed_order_entity_1 = require("../../listed-order/entities/listed-order.entity");
const payment_entity_1 = require("../../payments/entities/payment.entity");
const delivery_slot_entity_1 = require("../../delivery-slot/entities/delivery-slot.entity");
const vendor_subscription_plan_entity_1 = require("../../vendor-subscription-plan/entities/vendor-subscription-plan.entity");
let Order = class Order {
    id;
    customer;
    vendor;
    community;
    vendorSubscriptionPlan;
    deliverySlot;
    createdAt;
    completedAt;
    orderStatus;
    paymentStatus;
    deliveryDate;
    isDeleted;
    grandTotal;
    listedOrders;
    payments;
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, customer => customer.orders, { nullable: false }),
    __metadata("design:type", customer_entity_1.Customer)
], Order.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor, vendor => vendor.orders, { nullable: true }),
    __metadata("design:type", Object)
], Order.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => community_entity_1.Community, community => community.orders, { nullable: false }),
    __metadata("design:type", community_entity_1.Community)
], Order.prototype, "community", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_subscription_plan_entity_1.VendorSubscriptionPlan, vendorSubscriptionPlan => vendorSubscriptionPlan.order, { nullable: true }),
    __metadata("design:type", vendor_subscription_plan_entity_1.VendorSubscriptionPlan)
], Order.prototype, "vendorSubscriptionPlan", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => delivery_slot_entity_1.DeliverySlot, deliverySlot => deliverySlot.orders, { nullable: true }),
    __metadata("design:type", Object)
], Order.prototype, "deliverySlot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Order.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['DRAFTED', 'PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
        default: 'DRAFTED'
    }),
    __metadata("design:type", String)
], Order.prototype, "orderStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['PENDING', 'PAID', 'PARTIAL', 'FAILED'],
        default: 'PENDING'
    }),
    __metadata("design:type", String)
], Order.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Order.prototype, "deliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Order.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => listed_order_entity_1.ListedOrder, listedOrder => listedOrder.order, { cascade: true }),
    __metadata("design:type", Array)
], Order.prototype, "listedOrders", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, payment => payment.order),
    __metadata("design:type", Array)
], Order.prototype, "payments", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)()
], Order);
//# sourceMappingURL=order.entity.js.map