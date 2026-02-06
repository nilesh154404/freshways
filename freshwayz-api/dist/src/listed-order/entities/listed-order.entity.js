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
exports.ListedOrder = void 0;
const class_transformer_1 = require("class-transformer");
const order_entity_1 = require("../../orders/entities/order.entity");
const product_discount_entity_1 = require("../../product-discount/entities/product-discount.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const typeorm_1 = require("typeorm");
let ListedOrder = class ListedOrder {
    id;
    order;
    product;
    productName;
    quantity;
    amount;
    discountedAmount;
    productDiscount;
    notes;
};
exports.ListedOrder = ListedOrder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ListedOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, order => order.listedOrders, { nullable: false }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", order_entity_1.Order)
], ListedOrder.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { nullable: true }),
    __metadata("design:type", Object)
], ListedOrder.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], ListedOrder.prototype, "productName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], ListedOrder.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], ListedOrder.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], ListedOrder.prototype, "discountedAmount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_discount_entity_1.ProductDiscount, { nullable: true }),
    __metadata("design:type", Object)
], ListedOrder.prototype, "productDiscount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], ListedOrder.prototype, "notes", void 0);
exports.ListedOrder = ListedOrder = __decorate([
    (0, typeorm_1.Entity)()
], ListedOrder);
//# sourceMappingURL=listed-order.entity.js.map