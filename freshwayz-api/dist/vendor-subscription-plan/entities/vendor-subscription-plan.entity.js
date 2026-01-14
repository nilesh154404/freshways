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
exports.VendorSubscriptionPlan = void 0;
const delivery_slot_entity_1 = require("../../delivery-slot/entities/delivery-slot.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const subscription_entity_1 = require("../../subscription/entities/subscription.entity");
const vendor_entity_1 = require("../../vendor/entities/vendor.entity");
const typeorm_1 = require("typeorm");
let VendorSubscriptionPlan = class VendorSubscriptionPlan {
    id;
    label;
    description;
    products;
    order;
    subscriptions;
    vendor;
    deliverySlot;
};
exports.VendorSubscriptionPlan = VendorSubscriptionPlan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VendorSubscriptionPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30 }),
    __metadata("design:type", String)
], VendorSubscriptionPlan.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], VendorSubscriptionPlan.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.Product, product => product.vendorSubscriptionPlan),
    __metadata("design:type", product_entity_1.Product)
], VendorSubscriptionPlan.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, order => order.vendorSubscriptionPlan),
    __metadata("design:type", order_entity_1.Order)
], VendorSubscriptionPlan.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subscription_entity_1.Subscription, subscription => subscription.plan),
    __metadata("design:type", Array)
], VendorSubscriptionPlan.prototype, "subscriptions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor, vendor => vendor.vendorSubscriptionPlan),
    (0, typeorm_1.JoinColumn)({ name: 'vendorId' }),
    __metadata("design:type", vendor_entity_1.Vendor)
], VendorSubscriptionPlan.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => delivery_slot_entity_1.DeliverySlot, deliverySlot => deliverySlot.vendorSubscriptionPlan, { nullable: true }),
    __metadata("design:type", delivery_slot_entity_1.DeliverySlot)
], VendorSubscriptionPlan.prototype, "deliverySlot", void 0);
exports.VendorSubscriptionPlan = VendorSubscriptionPlan = __decorate([
    (0, typeorm_1.Entity)()
], VendorSubscriptionPlan);
//# sourceMappingURL=vendor-subscription-plan.entity.js.map