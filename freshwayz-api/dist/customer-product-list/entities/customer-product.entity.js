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
exports.CustomerProduct = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../../products/entities/product.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const vendor_subscription_plan_entity_1 = require("../../vendor-subscription-plan/entities/vendor-subscription-plan.entity");
let CustomerProduct = class CustomerProduct {
    id;
    customer;
    vendorSubscriptionPlan;
    product;
    productName;
    quantity;
    amount;
    notes;
};
exports.CustomerProduct = CustomerProduct;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustomerProduct.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], CustomerProduct.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_subscription_plan_entity_1.VendorSubscriptionPlan, { eager: true }),
    __metadata("design:type", vendor_subscription_plan_entity_1.VendorSubscriptionPlan)
], CustomerProduct.prototype, "vendorSubscriptionPlan", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { nullable: true, eager: true }),
    __metadata("design:type", Object)
], CustomerProduct.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], CustomerProduct.prototype, "productName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], CustomerProduct.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], CustomerProduct.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], CustomerProduct.prototype, "notes", void 0);
exports.CustomerProduct = CustomerProduct = __decorate([
    (0, typeorm_1.Entity)('customer_product_list')
], CustomerProduct);
//# sourceMappingURL=customer-product.entity.js.map