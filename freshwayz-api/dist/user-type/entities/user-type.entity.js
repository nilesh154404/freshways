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
exports.UserType = void 0;
const user_entity_1 = require("../../user/entities/user.entity");
const vendor_entity_1 = require("../../vendor/entities/vendor.entity");
const typeorm_1 = require("typeorm");
let UserType = class UserType {
    id;
    typeName;
    description;
    users;
    vendors;
    createdAt;
    updatedAt;
};
exports.UserType = UserType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UserType.prototype, "typeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, user => user.userType),
    __metadata("design:type", Array)
], UserType.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vendor_entity_1.Vendor, vendor => vendor.userType),
    __metadata("design:type", Array)
], UserType.prototype, "vendors", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserType.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserType.prototype, "updatedAt", void 0);
exports.UserType = UserType = __decorate([
    (0, typeorm_1.Entity)()
], UserType);
//# sourceMappingURL=user-type.entity.js.map