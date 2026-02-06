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
exports.Vendor = void 0;
const auth_entity_1 = require("../../auth/entities/auth.entity");
const categories_entity_1 = require("../../categories/categories.entity");
const daily_price_entity_1 = require("../../daily-price/entities/daily-price.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const user_type_entity_1 = require("../../user-type/entities/user-type.entity");
const vendor_subscription_plan_entity_1 = require("../../vendor-subscription-plan/entities/vendor-subscription-plan.entity");
const typeorm_1 = require("typeorm");
let Vendor = class Vendor {
    id;
    businessName;
    email;
    gstNumber;
    address;
    website;
    ownerName;
    bankName;
    accountNumber;
    ifscCode;
    auth;
    userType;
    orders;
    vendorSubscriptionPlan;
    products;
    dailyPrice;
    categories;
};
exports.Vendor = Vendor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Vendor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Vendor.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Vendor.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "gstNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "ownerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "ifscCode", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => auth_entity_1.Auth, auth => auth.vendor, { nullable: true }),
    __metadata("design:type", auth_entity_1.Auth)
], Vendor.prototype, "auth", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_type_entity_1.UserType, t => t.vendors, { nullable: false }),
    __metadata("design:type", user_type_entity_1.UserType)
], Vendor.prototype, "userType", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, order => order.vendor),
    __metadata("design:type", Array)
], Vendor.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vendor_subscription_plan_entity_1.VendorSubscriptionPlan, vendorSubscriptionPlan => vendorSubscriptionPlan.vendor, { nullable: true }),
    __metadata("design:type", vendor_subscription_plan_entity_1.VendorSubscriptionPlan)
], Vendor.prototype, "vendorSubscriptionPlan", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.Product, product => product.vendor),
    __metadata("design:type", product_entity_1.Product)
], Vendor.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => daily_price_entity_1.DailyPrice, dailyPrice => dailyPrice.vendor),
    __metadata("design:type", daily_price_entity_1.DailyPrice)
], Vendor.prototype, "dailyPrice", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => categories_entity_1.Categories, category => category.vendors),
    (0, typeorm_1.JoinTable)({
        name: 'vendor_categories',
        joinColumn: { name: 'vendor_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
    }),
    __metadata("design:type", Array)
], Vendor.prototype, "categories", void 0);
exports.Vendor = Vendor = __decorate([
    (0, typeorm_1.Entity)()
], Vendor);
//# sourceMappingURL=vendor.entity.js.map