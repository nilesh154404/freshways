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
var DailyPriceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyPriceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const daily_price_entity_1 = require("./entities/daily-price.entity");
const price_log_entity_1 = require("./entities/price-log.entity");
const product_entity_1 = require("../products/entities/product.entity");
const vendor_entity_1 = require("../vendor/entities/vendor.entity");
const schedule_1 = require("@nestjs/schedule");
let DailyPriceService = DailyPriceService_1 = class DailyPriceService {
    dailyPriceRepo;
    priceLogRepo;
    productRepo;
    vendorRepo;
    logger = new common_1.Logger(DailyPriceService_1.name);
    constructor(dailyPriceRepo, priceLogRepo, productRepo, vendorRepo) {
        this.dailyPriceRepo = dailyPriceRepo;
        this.priceLogRepo = priceLogRepo;
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
        const currentActive = await this.dailyPriceRepo.findOne({
            where: {
                product: { id: dto.productId },
                vendor: { id: dto.vendorId },
                isActive: true,
            },
            relations: ['product', 'vendor'],
        });
        if (currentActive && (currentActive.amount !== dto.amount || currentActive.mrp_amount !== dto.mrp_amount)) {
            const priceLog = new price_log_entity_1.PriceLog();
            priceLog.product = product;
            priceLog.vendor = vendor;
            priceLog.old_amount = currentActive.amount;
            priceLog.new_amount = dto.amount;
            priceLog.old_mrp = currentActive.mrp_amount;
            priceLog.new_mrp = dto.mrp_amount;
            await this.priceLogRepo.save(priceLog);
            this.logger.log(`Price log created - OLD: ${currentActive.amount}/${currentActive.mrp_amount} → NEW: ${dto.amount}/${dto.mrp_amount}`);
        }
        const existingSameDate = await this.dailyPriceRepo.findOne({
            where: {
                product: { id: dto.productId },
                vendor: { id: dto.vendorId },
                date: dto.date,
            },
            relations: ['product', 'vendor'],
        });
        if (existingSameDate) {
            existingSameDate.amount = dto.amount;
            existingSameDate.mrp_amount = dto.mrp_amount;
            existingSameDate.date = dto.date;
            existingSameDate.isActive = dto.isActive ?? true;
            existingSameDate.product = product;
            existingSameDate.vendor = vendor;
            return this.dailyPriceRepo.save(existingSameDate);
        }
        const shouldBeActive = dto.isActive ?? true;
        if (shouldBeActive) {
            await this.dailyPriceRepo
                .createQueryBuilder()
                .update(daily_price_entity_1.DailyPrice)
                .set({ isActive: false })
                .where('productId = :productId', { productId: dto.productId })
                .andWhere('vendorId = :vendorId', { vendorId: dto.vendorId })
                .andWhere('isActive = :isActive', { isActive: true })
                .execute();
        }
        const dailyPrice = this.dailyPriceRepo.create({
            amount: dto.amount,
            mrp_amount: dto.mrp_amount,
            date: dto.date,
            isActive: shouldBeActive,
            product,
            vendor
        });
        return this.dailyPriceRepo.save(dailyPrice);
    }
    findAll(vendorId, productId) {
        const query = this.dailyPriceRepo
            .createQueryBuilder('daily_price')
            .leftJoinAndSelect('daily_price.product', 'product')
            .leftJoinAndSelect('daily_price.vendor', 'vendor')
            .orderBy('daily_price.date', 'DESC')
            .addOrderBy('daily_price.updatedAt', 'DESC')
            .addOrderBy('daily_price.id', 'DESC');
        if (vendorId) {
            query.andWhere('vendor.id = :vendorId', { vendorId });
        }
        if (productId) {
            query.andWhere('product.id = :productId', { productId });
        }
        return query.getMany();
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
    async getPriceHistory(productId, vendorId) {
        const query = this.priceLogRepo
            .createQueryBuilder('price_log')
            .leftJoinAndSelect('price_log.product', 'product')
            .leftJoinAndSelect('price_log.vendor', 'vendor')
            .select([
            'price_log.id',
            'price_log.old_amount',
            'price_log.new_amount',
            'price_log.old_mrp',
            'price_log.new_mrp',
            'price_log.changedAt',
            'product.id',
            'product.label',
            'vendor.id',
            'vendor.businessName'
        ])
            .where('product.id = :productId', { productId })
            .orderBy('price_log.changedAt', 'DESC');
        if (vendorId) {
            query.andWhere('vendor.id = :vendorId', { vendorId });
        }
        return query.getMany();
    }
    async monitorPriceChanges() {
        try {
            this.logger.log('Starting price change monitoring...');
            const activePrices = await this.dailyPriceRepo.find({
                where: { isActive: true },
                relations: ['product', 'vendor'],
            });
            for (const activePrice of activePrices) {
                const latestLog = await this.priceLogRepo.findOne({
                    where: {
                        product: { id: activePrice.product.id },
                        vendor: { id: activePrice.vendor.id },
                    },
                    order: { changedAt: 'DESC' },
                });
                const shouldLog = !latestLog ||
                    latestLog.new_amount !== activePrice.amount ||
                    latestLog.new_mrp !== activePrice.mrp_amount;
                if (shouldLog) {
                    const priceLog = new price_log_entity_1.PriceLog();
                    priceLog.product = activePrice.product;
                    priceLog.vendor = activePrice.vendor;
                    priceLog.old_amount = latestLog?.new_amount || null;
                    priceLog.new_amount = activePrice.amount;
                    priceLog.old_mrp = latestLog?.new_mrp || null;
                    priceLog.new_mrp = activePrice.mrp_amount;
                    await this.priceLogRepo.save(priceLog);
                    this.logger.log(`Detected price change for product ${activePrice.product.id}, vendor ${activePrice.vendor.id}`);
                }
            }
            this.logger.log('Price change monitoring completed');
        }
        catch (error) {
            this.logger.error('Failed to monitor price changes', error);
        }
    }
    async syncActivePrices() {
        try {
            const latestByGroup = await this.dailyPriceRepo
                .createQueryBuilder('dp')
                .select('dp.productId', 'productId')
                .addSelect('dp.vendorId', 'vendorId')
                .addSelect('MAX(dp.date)', 'maxDate')
                .groupBy('dp.productId')
                .addGroupBy('dp.vendorId')
                .getRawMany();
            const latestIds = [];
            for (const row of latestByGroup) {
                const latest = await this.dailyPriceRepo
                    .createQueryBuilder('dp')
                    .select('dp.id', 'id')
                    .where('dp.productId = :productId', { productId: row.productId })
                    .andWhere('dp.vendorId = :vendorId', { vendorId: row.vendorId })
                    .andWhere('dp.date = :maxDate', { maxDate: row.maxDate })
                    .orderBy('dp.id', 'DESC')
                    .getRawOne();
                if (latest?.id)
                    latestIds.push(Number(latest.id));
            }
            if (latestIds.length === 0)
                return;
            await this.dailyPriceRepo
                .createQueryBuilder()
                .update(daily_price_entity_1.DailyPrice)
                .set({ isActive: false })
                .execute();
            await this.dailyPriceRepo
                .createQueryBuilder()
                .update(daily_price_entity_1.DailyPrice)
                .set({ isActive: true })
                .where('id IN (:...ids)', { ids: latestIds })
                .execute();
        }
        catch (error) {
            this.logger.error('Failed to sync active daily prices', error);
        }
    }
};
exports.DailyPriceService = DailyPriceService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DailyPriceService.prototype, "monitorPriceChanges", null);
__decorate([
    (0, schedule_1.Cron)('0 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DailyPriceService.prototype, "syncActivePrices", null);
exports.DailyPriceService = DailyPriceService = DailyPriceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(daily_price_entity_1.DailyPrice)),
    __param(1, (0, typeorm_1.InjectRepository)(price_log_entity_1.PriceLog)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DailyPriceService);
//# sourceMappingURL=daily-price.service.js.map