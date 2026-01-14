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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("./entities/subscription.entity");
const customer_entity_1 = require("../customer/entities/customer.entity");
const vendor_subscription_plan_entity_1 = require("../vendor-subscription-plan/entities/vendor-subscription-plan.entity");
let SubscriptionService = class SubscriptionService {
    subscriptionRepo;
    customerRepo;
    planRepo;
    constructor(subscriptionRepo, customerRepo, planRepo) {
        this.subscriptionRepo = subscriptionRepo;
        this.customerRepo = customerRepo;
        this.planRepo = planRepo;
    }
    async create(dto) {
        const customer = await this.customerRepo.findOne({ where: { id: dto.customerId } });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const plan = await this.planRepo.findOne({ where: { id: dto.planId } });
        if (!plan)
            throw new common_1.NotFoundException('Subscription plan not found');
        const existing = await this.subscriptionRepo.findOne({
            where: {
                customer: { id: dto.customerId },
                plan: { id: dto.planId },
                active: true,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Customer already has an active subscription for this plan');
        }
        const subscription = this.subscriptionRepo.create({
            customer,
            plan,
            active: dto.active ?? true,
        });
        return this.subscriptionRepo.save(subscription);
    }
    findAll() {
        return this.subscriptionRepo.find({
            relations: ['customer', 'plan', 'plan.vendor'],
        });
    }
    async findOne(id) {
        const subscription = await this.subscriptionRepo.findOne({
            where: { id },
            relations: ['customer', 'plan', 'plan.vendor'],
        });
        if (!subscription)
            throw new common_1.NotFoundException('Subscription not found');
        return subscription;
    }
    async update(id, dto) {
        const subscription = await this.findOne(id);
        if (dto.active === true) {
            const existing = await this.subscriptionRepo.findOne({
                where: {
                    customer: { id: dto.customerId ?? subscription.customer.id },
                    plan: { id: dto.planId ?? subscription.plan.id },
                    active: true,
                },
            });
            if (existing && existing.id !== id) {
                throw new common_1.BadRequestException('Customer already has an active subscription for this plan');
            }
        }
        Object.assign(subscription, dto);
        return this.subscriptionRepo.save(subscription);
    }
    async remove(id) {
        const subscription = await this.findOne(id);
        return this.subscriptionRepo.remove(subscription);
    }
    async findByCustomer(customerId, onlyActive = false) {
        return this.subscriptionRepo.find({
            where: {
                customer: { id: customerId },
                ...(onlyActive ? { active: true } : {}),
            },
            relations: ['customer', 'plan', 'plan.vendor'],
        });
    }
    async findByVendor(vendorId, onlyActive = false) {
        return this.subscriptionRepo.find({
            where: {
                plan: { vendor: { id: vendorId } },
                ...(onlyActive ? { active: true } : {}),
            },
            relations: ['customer', 'plan', 'plan.vendor'],
        });
    }
    async findByCustomerAndVendor(customerId, vendorId, onlyActive = false) {
        return this.subscriptionRepo.find({
            where: {
                customer: { id: customerId },
                plan: { vendor: { id: vendorId } },
                ...(onlyActive ? { active: true } : {}),
            },
            relations: ['customer', 'plan', 'plan.vendor'],
        });
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(2, (0, typeorm_1.InjectRepository)(vendor_subscription_plan_entity_1.VendorSubscriptionPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map