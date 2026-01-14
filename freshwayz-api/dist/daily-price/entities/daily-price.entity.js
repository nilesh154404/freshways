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
exports.DailyPrice = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../../products/entities/product.entity");
const vendor_entity_1 = require("../../vendor/entities/vendor.entity");
let DailyPrice = class DailyPrice {
    id;
    amount;
    mrp_amount;
    date;
    isActive;
    product;
    vendor;
};
exports.DailyPrice = DailyPrice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DailyPrice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DailyPrice.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DailyPrice.prototype, "mrp_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], DailyPrice.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], DailyPrice.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, product => product.dailyPrices, { nullable: false }),
    __metadata("design:type", product_entity_1.Product)
], DailyPrice.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor, vendor => vendor.dailyPrice, { nullable: false }),
    __metadata("design:type", vendor_entity_1.Vendor)
], DailyPrice.prototype, "vendor", void 0);
exports.DailyPrice = DailyPrice = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(["product", "vendor", "date"]),
    (0, typeorm_1.Index)(["product", "vendor"], { unique: true, where: "isActive = true" })
], DailyPrice);
//# sourceMappingURL=daily-price.entity.js.map