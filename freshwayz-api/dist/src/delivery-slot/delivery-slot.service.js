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
exports.DeliverySlotsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const delivery_slot_entity_1 = require("./entities/delivery-slot.entity");
let DeliverySlotsService = class DeliverySlotsService {
    slotRepository;
    constructor(slotRepository) {
        this.slotRepository = slotRepository;
    }
    create(dto) {
        const slot = this.slotRepository.create(dto);
        return this.slotRepository.save(slot);
    }
    findAll() {
        return this.slotRepository.find({ order: { date: 'ASC' } });
    }
    async findOne(id) {
        const slot = await this.slotRepository.findOne({ where: { id } });
        if (!slot)
            throw new common_1.NotFoundException('Delivery slot not found');
        return slot;
    }
    async findOneByVendorSubscriptionPlanId(id) {
        const slot = await this.slotRepository.find({ where: { vendorSubscriptionPlan: { id } } });
        if (!slot)
            throw new common_1.NotFoundException('Delivery slot not found');
        return slot;
    }
    async update(id, dto) {
        const slot = await this.findOne(id);
        Object.assign(slot, dto);
        return this.slotRepository.save(slot);
    }
    async remove(id) {
        const slot = await this.findOne(id);
        return this.slotRepository.remove(slot);
    }
};
exports.DeliverySlotsService = DeliverySlotsService;
exports.DeliverySlotsService = DeliverySlotsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(delivery_slot_entity_1.DeliverySlot)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DeliverySlotsService);
//# sourceMappingURL=delivery-slot.service.js.map