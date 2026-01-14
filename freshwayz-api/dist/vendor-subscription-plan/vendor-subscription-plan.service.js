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
exports.VendorSubscriptionPlanService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vendor_subscription_plan_entity_1 = require("./entities/vendor-subscription-plan.entity");
let VendorSubscriptionPlanService = class VendorSubscriptionPlanService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(dto) {
        const plan = this.repo.create({
            label: dto.label,
            description: dto.description,
            vendor: { id: dto.vendorId },
        });
        return this.repo.save(plan);
    }
    async findAll() {
        return this.repo.find({ relations: ['vendor'] });
    }
    async findOne(id) {
        const plan = await this.repo.findOne({
            where: { id },
            relations: ['vendor'],
        });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        return plan;
    }
    async update(id, dto) {
        const plan = await this.findOne(id);
        if (dto.vendorId)
            plan.vendor = { id: dto.vendorId };
        Object.assign(plan, dto);
        return this.repo.save(plan);
    }
    async remove(id) {
        const plan = await this.findOne(id);
        return this.repo.remove(plan);
    }
    async findByVendor(vendorId) {
        const plan = await this.repo.find({
            where: { vendor: { id: vendorId } },
            relations: ['vendor'],
        });
        if (!plan)
            throw new common_1.NotFoundException(`No subscription plan found for vendor ${vendorId}`);
        return plan;
    }
};
exports.VendorSubscriptionPlanService = VendorSubscriptionPlanService;
exports.VendorSubscriptionPlanService = VendorSubscriptionPlanService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_subscription_plan_entity_1.VendorSubscriptionPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VendorSubscriptionPlanService);
//# sourceMappingURL=vendor-subscription-plan.service.js.map