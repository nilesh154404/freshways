"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerProductListModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_product_entity_1 = require("./entities/customer-product.entity");
const customer_product_list_service_1 = require("./customer-product-list.service");
const customer_product_list_controller_1 = require("./customer-product-list.controller");
const customer_entity_1 = require("../customer/entities/customer.entity");
const product_entity_1 = require("../products/entities/product.entity");
const vendor_subscription_plan_entity_1 = require("../vendor-subscription-plan/entities/vendor-subscription-plan.entity");
let CustomerProductListModule = class CustomerProductListModule {
};
exports.CustomerProductListModule = CustomerProductListModule;
exports.CustomerProductListModule = CustomerProductListModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                customer_product_entity_1.CustomerProduct,
                customer_entity_1.Customer,
                product_entity_1.Product,
                vendor_subscription_plan_entity_1.VendorSubscriptionPlan,
            ]),
        ],
        controllers: [customer_product_list_controller_1.CustomerProductListController],
        providers: [customer_product_list_service_1.CustomerProductListService],
    })
], CustomerProductListModule);
//# sourceMappingURL=customer-product-list.module.js.map