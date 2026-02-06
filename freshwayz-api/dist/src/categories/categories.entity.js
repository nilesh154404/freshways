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
exports.Categories = void 0;
const product_entity_1 = require("../products/entities/product.entity");
const vendor_entity_1 = require("../vendor/entities/vendor.entity");
const typeorm_1 = require("typeorm");
let Categories = class Categories extends typeorm_1.BaseEntity {
    id;
    label;
    is_active;
    img_link;
    name;
    order;
    products;
    vendors;
};
exports.Categories = Categories;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Categories.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Categories.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)('bool', { default: true }),
    __metadata("design:type", Boolean)
], Categories.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Categories.prototype, "img_link", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Categories.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Categories.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => product_entity_1.Product, products => products.category),
    __metadata("design:type", Array)
], Categories.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => vendor_entity_1.Vendor, vendor => vendor.categories),
    __metadata("design:type", Array)
], Categories.prototype, "vendors", void 0);
exports.Categories = Categories = __decorate([
    (0, typeorm_1.Entity)()
], Categories);
//# sourceMappingURL=categories.entity.js.map