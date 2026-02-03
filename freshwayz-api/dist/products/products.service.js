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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const service_offering_entity_1 = require("../service-offering/entities/service-offering.entity");
const vendor_subscription_plan_entity_1 = require("../vendor-subscription-plan/entities/vendor-subscription-plan.entity");
const pagination_1 = require("../helpers/pagination/pagination");
const categories_entity_1 = require("../categories/categories.entity");
const vendor_entity_1 = require("../vendor/entities/vendor.entity");
let ProductsService = class ProductsService {
    productRepo;
    serviceOfferingRepo;
    vendorPlanRepo;
    categoryRepo;
    vendorRepo;
    constructor(productRepo, serviceOfferingRepo, vendorPlanRepo, categoryRepo, vendorRepo) {
        this.productRepo = productRepo;
        this.serviceOfferingRepo = serviceOfferingRepo;
        this.vendorPlanRepo = vendorPlanRepo;
        this.categoryRepo = categoryRepo;
        this.vendorRepo = vendorRepo;
    }
    async create(createProductDto) {
        try {
            const { label, description, productUrl, measurementUnit, measurementValue, vendorSubscriptionPlanId, categoryId, vendorId } = createProductDto;
            const vendorSubscriptionPlan = await this.vendorPlanRepo.findOne({
                where: { id: vendorSubscriptionPlanId },
            });
            if (!vendorSubscriptionPlan) {
                throw new common_1.NotFoundException(`Vendor Subscription Plan with ID ${vendorSubscriptionPlanId} not found`);
            }
            const category = await this.categoryRepo.findOne({
                where: { id: categoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException(`Vendor Subscription Plan with ID ${categoryId} not found`);
            }
            const vendor = await this.vendorRepo.findOne({
                where: { id: vendorId },
            });
            if (!vendor) {
                throw new common_1.NotFoundException(`Vendor Subscription Plan with ID ${vendor} not found`);
            }
            const product = this.productRepo.create({
                label,
                description,
                productUrl,
                measurementUnit,
                measurementValue,
                category,
                vendor,
                vendorSubscriptionPlan,
            });
            return await this.productRepo.save(product);
        }
        catch (error) {
            console.error('Error creating product:', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Unable to create product');
        }
    }
    async findAll(dto, categoryId, vendorId) {
        const qb = this.productRepo
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.serviceOffering', 'serviceOffering')
            .leftJoinAndSelect('product.vendorSubscriptionPlan', 'vendorSubscriptionPlan')
            .leftJoinAndSelect('product.vendor', 'vendor')
            .leftJoinAndSelect('product.dailyPrices', 'dailyPrices')
            .leftJoinAndSelect('product.discounts', 'discounts')
            .orderBy('product.id', 'DESC');
        if (categoryId) {
            qb.andWhere('product.category = :categoryId', { categoryId });
        }
        if (vendorId) {
            qb.andWhere('product.vendor = :vendorId', { vendorId });
        }
        return (0, pagination_1.paginate)(qb, {
            page: dto.page,
            limit: dto.limit,
        });
    }
    async getProductsCount(vendorId) {
        const where = {};
        if (vendorId) {
            where.vendor = { id: vendorId };
        }
        const total = await this.productRepo.count({ where });
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const newThisMonth = await this.productRepo.count({
            where: {
                ...where,
                createdAt: (0, typeorm_2.MoreThanOrEqual)(firstDayCurrentMonth),
            }
        });
        const newLastMonth = await this.productRepo.count({
            where: {
                ...where,
                createdAt: (0, typeorm_2.Between)(firstDayLastMonth, lastDayLastMonth),
            }
        });
        let growth = 0;
        if (newLastMonth > 0) {
            growth = ((newThisMonth - newLastMonth) / newLastMonth) * 100;
        }
        else if (newThisMonth > 0) {
            growth = 100;
        }
        return { total, growth: Math.round(growth), newThisMonth };
    }
    findOne(id) {
        return this.productRepo.findOne({
            where: { id },
            relations: ['serviceOffering', 'vendorSubscriptionPlan'],
        });
    }
    update(id, dto) {
        return `This action updates product #${id}`;
    }
    remove(id) {
        return this.productRepo.delete(id);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(service_offering_entity_1.ServiceOffering)),
    __param(2, (0, typeorm_1.InjectRepository)(vendor_subscription_plan_entity_1.VendorSubscriptionPlan)),
    __param(3, (0, typeorm_1.InjectRepository)(categories_entity_1.Categories)),
    __param(4, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map