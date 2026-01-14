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
exports.Product = void 0;
const categories_entity_1 = require("../../categories/categories.entity");
const daily_price_entity_1 = require("../../daily-price/entities/daily-price.entity");
const product_discount_entity_1 = require("../../product-discount/entities/product-discount.entity");
const service_offering_entity_1 = require("../../service-offering/entities/service-offering.entity");
const vendor_subscription_plan_entity_1 = require("../../vendor-subscription-plan/entities/vendor-subscription-plan.entity");
const vendor_entity_1 = require("../../vendor/entities/vendor.entity");
const typeorm_1 = require("typeorm");
let Product = class Product {
    id;
    label;
    description;
    productUrl;
    measurementUnit;
    measurementValue;
    serviceOffering;
    dailyPrices;
    vendor;
    vendorSubscriptionPlan;
    category;
    discounts;
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "productUrl", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "measurementUnit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "measurementValue", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_offering_entity_1.ServiceOffering, serviceOffering => serviceOffering.products, { nullable: true }),
    __metadata("design:type", service_offering_entity_1.ServiceOffering)
], Product.prototype, "serviceOffering", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => daily_price_entity_1.DailyPrice, dailyPrice => dailyPrice.product),
    __metadata("design:type", Array)
], Product.prototype, "dailyPrices", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor, vendor => vendor.products, { nullable: true }),
    __metadata("design:type", vendor_entity_1.Vendor)
], Product.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_subscription_plan_entity_1.VendorSubscriptionPlan, vendorSubscriptionPlan => vendorSubscriptionPlan.products, { nullable: true }),
    __metadata("design:type", vendor_subscription_plan_entity_1.VendorSubscriptionPlan)
], Product.prototype, "vendorSubscriptionPlan", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => categories_entity_1.Categories, category => category.products),
    (0, typeorm_1.JoinColumn)({ name: "category", referencedColumnName: "id" }),
    __metadata("design:type", categories_entity_1.Categories)
], Product.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_discount_entity_1.ProductDiscount, discount => discount.product),
    __metadata("design:type", Array)
], Product.prototype, "discounts", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)()
], Product);
//# sourceMappingURL=product.entity.js.map