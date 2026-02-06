"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const vendor_service_1 = require("./vendor.service");
const vendor_controller_1 = require("./vendor.controller");
const vendor_entity_1 = require("./entities/vendor.entity");
const user_type_entity_1 = require("../user-type/entities/user-type.entity");
const categories_entity_1 = require("../categories/categories.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const product_entity_1 = require("../products/entities/product.entity");
const marketing_content_entity_1 = require("../marketing-content/entities/marketing-content.entity");
const customer_entity_1 = require("../customer/entities/customer.entity");
let VendorModule = class VendorModule {
};
exports.VendorModule = VendorModule;
exports.VendorModule = VendorModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([vendor_entity_1.Vendor, user_type_entity_1.UserType, categories_entity_1.Categories, order_entity_1.Order, product_entity_1.Product, marketing_content_entity_1.MarketingContent, customer_entity_1.Customer])],
        controllers: [vendor_controller_1.VendorController],
        providers: [vendor_service_1.VendorService],
    })
], VendorModule);
//# sourceMappingURL=vendor.module.js.map