"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeederModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const seeder_controller_1 = require("./seeder.controller");
const vendor_entity_1 = require("../vendor/entities/vendor.entity");
const product_entity_1 = require("../products/entities/product.entity");
const customer_entity_1 = require("../customer/entities/customer.entity");
const user_type_entity_1 = require("../user-type/entities/user-type.entity");
const user_entity_1 = require("../user/entities/user.entity");
let SeederModule = class SeederModule {
};
exports.SeederModule = SeederModule;
exports.SeederModule = SeederModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([vendor_entity_1.Vendor, product_entity_1.Product, customer_entity_1.Customer, user_type_entity_1.UserType, user_entity_1.User]),
        ],
        controllers: [seeder_controller_1.SeederController],
    })
], SeederModule);
//# sourceMappingURL=seeder.module.js.map