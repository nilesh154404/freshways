"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const order_entity_1 = require("./entities/order.entity");
const customer_entity_1 = require("../customer/entities/customer.entity");
const vendor_entity_1 = require("../vendor/entities/vendor.entity");
const community_entity_1 = require("../community/entities/community.entity");
const listed_order_entity_1 = require("../listed-order/entities/listed-order.entity");
const orders_service_1 = require("./orders.service");
const orders_controller_1 = require("./orders.controller");
const product_entity_1 = require("../products/entities/product.entity");
const delivery_slot_entity_1 = require("../delivery-slot/entities/delivery-slot.entity");
const vendor_subscription_plan_entity_1 = require("../vendor-subscription-plan/entities/vendor-subscription-plan.entity");
const product_discount_service_1 = require("../product-discount/product-discount.service");
const daily_price_entity_1 = require("../daily-price/entities/daily-price.entity");
const product_discount_entity_1 = require("../product-discount/entities/product-discount.entity");
const customer_product_entity_1 = require("../customer-product-list/entities/customer-product.entity");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, customer_entity_1.Customer, vendor_entity_1.Vendor, community_entity_1.Community, product_entity_1.Product, listed_order_entity_1.ListedOrder, delivery_slot_entity_1.DeliverySlot, vendor_subscription_plan_entity_1.VendorSubscriptionPlan, daily_price_entity_1.DailyPrice, product_discount_entity_1.ProductDiscount, customer_product_entity_1.CustomerProduct])],
        controllers: [orders_controller_1.OrderController],
        providers: [orders_service_1.OrderService, product_discount_service_1.ProductDiscountService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map