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
exports.ProductDiscountService = void 0;
const common_1 = require("@nestjs/common");
const discount_type_enum_1 = require("./entities/discount-type.enum");
const product_discount_entity_1 = require("./entities/product-discount.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const product_entity_1 = require("../products/entities/product.entity");
let ProductDiscountService = class ProductDiscountService {
    discountRepo;
    productRepo;
    constructor(discountRepo, productRepo) {
        this.discountRepo = discountRepo;
        this.productRepo = productRepo;
    }
    calculatePrice(basePrice, quantity, discount) {
        if (!discount)
            return { finalTotal: basePrice * quantity };
        switch (discount.type) {
            case discount_type_enum_1.DiscountType.PERCENTAGE:
                return { finalTotal: basePrice * quantity * (1 - discount.value / 100) };
            case discount_type_enum_1.DiscountType.FLAT:
                return { finalTotal: Math.max(basePrice * quantity - discount.value, 0) };
            case discount_type_enum_1.DiscountType.BOGO:
                if (!discount.buyQuantity || !discount.getQuantity)
                    return { finalTotal: basePrice * quantity };
                const groupSize = discount.buyQuantity + discount.getQuantity;
                const eligibleGroups = Math.floor(quantity / groupSize);
                const freeItems = eligibleGroups * discount.getQuantity;
                const payableQty = quantity - freeItems;
                return { finalTotal: payableQty * basePrice, freeItems };
            default:
                return { finalTotal: basePrice * quantity };
        }
    }
    async create(dto) {
        const product = await this.productRepo.findOneBy({ id: dto.productId });
        if (!product)
            throw new common_1.NotFoundException(`Product with id ${dto.productId} not found`);
        const discount = this.discountRepo.create({ ...dto, product });
        return this.discountRepo.save(discount);
    }
    async findAll() {
        return this.discountRepo.find({ relations: ['product'] });
    }
    async findOne(id) {
        const discount = await this.discountRepo.findOne({ where: { id }, relations: ['product'] });
        if (!discount)
            throw new common_1.NotFoundException(`Discount with id ${id} not found`);
        return discount;
    }
    async update(id, dto) {
        const discount = await this.findOne(id);
        if (dto.productId) {
            const product = await this.productRepo.findOneBy({ id: dto.productId });
            if (!product)
                throw new common_1.NotFoundException(`Product with id ${dto.productId} not found`);
            discount.product = product;
        }
        Object.assign(discount, dto);
        return this.discountRepo.save(discount);
    }
    async remove(id) {
        const discount = await this.findOne(id);
        await this.discountRepo.remove(discount);
    }
};
exports.ProductDiscountService = ProductDiscountService;
exports.ProductDiscountService = ProductDiscountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(product_discount_entity_1.ProductDiscount)),
    __param(1, (0, typeorm_2.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository])
], ProductDiscountService);
//# sourceMappingURL=product-discount.service.js.map