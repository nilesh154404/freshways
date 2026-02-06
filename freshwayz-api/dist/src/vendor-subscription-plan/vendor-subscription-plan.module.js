"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorSubscriptionPlanModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const vendor_subscription_plan_entity_1 = require("./entities/vendor-subscription-plan.entity");
const vendor_subscription_plan_service_1 = require("./vendor-subscription-plan.service");
const vendor_subscription_plan_controller_1 = require("./vendor-subscription-plan.controller");
let VendorSubscriptionPlanModule = class VendorSubscriptionPlanModule {
};
exports.VendorSubscriptionPlanModule = VendorSubscriptionPlanModule;
exports.VendorSubscriptionPlanModule = VendorSubscriptionPlanModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([vendor_subscription_plan_entity_1.VendorSubscriptionPlan])],
        controllers: [vendor_subscription_plan_controller_1.VendorSubscriptionPlanController],
        providers: [vendor_subscription_plan_service_1.VendorSubscriptionPlanService],
        exports: [vendor_subscription_plan_service_1.VendorSubscriptionPlanService],
    })
], VendorSubscriptionPlanModule);
//# sourceMappingURL=vendor-subscription-plan.module.js.map