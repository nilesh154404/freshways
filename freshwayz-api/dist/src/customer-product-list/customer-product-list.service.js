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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerProductListService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_product_entity_1 = require("./entities/customer-product.entity");
const customer_entity_1 = require("../customer/entities/customer.entity");
const vendor_subscription_plan_entity_1 = require("../vendor-subscription-plan/entities/vendor-subscription-plan.entity");
const product_entity_1 = require("../products/entities/product.entity");
let CustomerProductListService = class CustomerProductListService {
    customerProductRepo;
    customerRepo;
    productRepo;
    planRepo;
    constructor(customerProductRepo, customerRepo, productRepo, planRepo) {
        this.customerProductRepo = customerProductRepo;
        this.customerRepo = customerRepo;
        this.productRepo = productRepo;
        this.planRepo = planRepo;
    }
    async create(dto) {
        const customer = await this.customerRepo.findOneBy({ id: dto.customerId });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const plan = await this.planRepo.findOneBy({
            id: dto.vendorSubscriptionPlanId,
        });
        if (!plan)
            throw new common_1.NotFoundException('Subscription plan not found');
        let product = null;
        if (dto.productId != null) {
            product = await this.productRepo.findOneBy({ id: dto.productId });
            if (!product)
                throw new common_1.NotFoundException('Product not found');
        }
        const customerProduct = this.customerProductRepo.create({
            customer,
            vendorSubscriptionPlan: plan,
            product,
            productName: dto.productName ?? null,
            quantity: dto.quantity ?? null,
            amount: dto.amount ?? null,
            notes: dto.notes ?? null,
        });
        return this.customerProductRepo.save(customerProduct);
    }
    async getByCustomerId(customerId) {
        return this.customerProductRepo.find({
            where: {
                customer: { id: customerId },
            },
            order: { id: 'DESC' },
        });
    }
    async deleteById(id) {
        const record = await this.customerProductRepo.findOneBy({ id });
        if (!record)
            throw new common_1.NotFoundException('Customer product not found');
        return this.customerProductRepo.remove(record);
    }
};
exports.CustomerProductListService = CustomerProductListService;
exports.CustomerProductListService = CustomerProductListService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_product_entity_1.CustomerProduct)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(vendor_subscription_plan_entity_1.VendorSubscriptionPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CustomerProductListService);
//# sourceMappingURL=customer-product-list.service.js.map