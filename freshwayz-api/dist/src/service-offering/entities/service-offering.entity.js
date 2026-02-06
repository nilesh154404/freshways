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
exports.ServiceOffering = void 0;
const product_entity_1 = require("../../products/entities/product.entity");
const typeorm_1 = require("typeorm");
let ServiceOffering = class ServiceOffering {
    serviceCode;
    serviceName;
    description;
    products;
};
exports.ServiceOffering = ServiceOffering;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 10 }),
    __metadata("design:type", String)
], ServiceOffering.prototype, "serviceCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], ServiceOffering.prototype, "serviceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], ServiceOffering.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.Product, product => product.serviceOffering),
    __metadata("design:type", Array)
], ServiceOffering.prototype, "products", void 0);
exports.ServiceOffering = ServiceOffering = __decorate([
    (0, typeorm_1.Entity)()
], ServiceOffering);
//# sourceMappingURL=service-offering.entity.js.map