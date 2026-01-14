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
exports.DailyPriceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const daily_price_entity_1 = require("./entities/daily-price.entity");
const product_entity_1 = require("../products/entities/product.entity");
const vendor_entity_1 = require("../vendor/entities/vendor.entity");
let DailyPriceService = class DailyPriceService {
    dailyPriceRepo;
    productRepo;
    vendorRepo;
    constructor(dailyPriceRepo, productRepo, vendorRepo) {
        this.dailyPriceRepo = dailyPriceRepo;
        this.productRepo = productRepo;
        this.vendorRepo = vendorRepo;
    }
    async create(dto) {
        const product = await this.productRepo.findOneBy({ id: dto.productId });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const vendor = await this.vendorRepo.findOneBy({ id: dto.vendorId });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        const dailyPrice = this.dailyPriceRepo.create({
            amount: dto.amount,
            mrp_amount: dto.mrp_amount,
            date: dto.date,
            isActive: dto.isActive ?? false,
            product,
            vendor
        });
        return this.dailyPriceRepo.save(dailyPrice);
    }
    findAll() {
        return this.dailyPriceRepo.find({
            relations: ['product', 'vendor']
        });
    }
    async findOne(id) {
        const price = await this.dailyPriceRepo.findOne({
            where: { id },
            relations: ['product', 'vendor']
        });
        if (!price)
            throw new common_1.NotFoundException('Daily price not found');
        return price;
    }
    async update(id, dto) {
        const price = await this.dailyPriceRepo.findOne({
            where: {
                id
            }
        });
        if (!price)
            throw new common_1.NotFoundException('Product not found');
        const product = await this.productRepo.findOneBy({ id: dto.productId });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const vendor = await this.vendorRepo.findOneBy({ id: dto.vendorId });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        price.vendor = vendor;
        Object.assign(price, dto);
        return this.dailyPriceRepo.save(price);
    }
    async remove(id) {
        const price = await this.findOne(id);
        return this.dailyPriceRepo.remove(price);
    }
};
exports.DailyPriceService = DailyPriceService;
exports.DailyPriceService = DailyPriceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(daily_price_entity_1.DailyPrice)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DailyPriceService);
//# sourceMappingURL=daily-price.service.js.map