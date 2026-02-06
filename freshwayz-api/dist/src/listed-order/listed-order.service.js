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
exports.ListedOrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const listed_order_entity_1 = require("./entities/listed-order.entity");
let ListedOrderService = class ListedOrderService {
    listedOrderRepository;
    constructor(listedOrderRepository) {
        this.listedOrderRepository = listedOrderRepository;
    }
    async findAll() {
        return this.listedOrderRepository.find({
            relations: ['order', 'product'],
        });
    }
    async findOne(id) {
        const item = await this.listedOrderRepository.findOne({
            where: { id },
            relations: ['order', 'product'],
        });
        if (!item)
            throw new common_1.NotFoundException(`ListedOrder #${id} not found`);
        return item;
    }
    async create(dto) {
        const item = new listed_order_entity_1.ListedOrder();
        item.product = dto.productId ? { id: dto.productId } : null;
        item.productName = dto.productName ?? null;
        item.quantity = dto.quantity ?? null;
        item.amount = dto.amount ?? null;
        item.notes = dto.notes ?? null;
        return this.listedOrderRepository.save(item);
    }
    async update(id, dto) {
        const item = await this.findOne(id);
        if (dto.orderId)
            item.order = { id: dto.orderId };
        if ('productId' in dto)
            item.product = dto.productId ? { id: dto.productId } : null;
        Object.assign(item, dto);
        return this.listedOrderRepository.save(item);
    }
    async remove(id) {
        const item = await this.findOne(id);
        await this.listedOrderRepository.remove(item);
    }
};
exports.ListedOrderService = ListedOrderService;
exports.ListedOrderService = ListedOrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(listed_order_entity_1.ListedOrder)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ListedOrderService);
//# sourceMappingURL=listed-order.service.js.map