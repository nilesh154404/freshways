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
exports.Auth = void 0;
const customer_entity_1 = require("../../customer/entities/customer.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const vendor_entity_1 = require("../../vendor/entities/vendor.entity");
const typeorm_1 = require("typeorm");
let Auth = class Auth {
    id;
    username;
    password;
    user;
    vendor;
    customer;
    createdAt;
    updatedAt;
};
exports.Auth = Auth;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Auth.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Auth.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Auth.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.auth, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], Auth.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => vendor_entity_1.Vendor, vendor => vendor.auth, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", vendor_entity_1.Vendor)
], Auth.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => customer_entity_1.Customer, customer => customer.auth, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", customer_entity_1.Customer)
], Auth.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Auth.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Auth.prototype, "updatedAt", void 0);
exports.Auth = Auth = __decorate([
    (0, typeorm_1.Entity)()
], Auth);
//# sourceMappingURL=auth.entity.js.map