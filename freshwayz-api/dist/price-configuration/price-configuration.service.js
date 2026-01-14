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
exports.PriceConfigurationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const price_configuration_entity_1 = require("./entities/price-configuration.entity");
let PriceConfigurationService = class PriceConfigurationService {
    priceConfigRepo;
    constructor(priceConfigRepo) {
        this.priceConfigRepo = priceConfigRepo;
    }
    create(dto) {
        const config = this.priceConfigRepo.create(dto);
        return this.priceConfigRepo.save(config);
    }
    findAll() {
        return this.priceConfigRepo.find();
    }
    async findOne(label) {
        const config = await this.priceConfigRepo.findOne({ where: { label } });
        if (!config)
            throw new common_1.NotFoundException('Price configuration not found');
        return config;
    }
    async update(label, dto) {
        const config = await this.findOne(label);
        Object.assign(config, dto);
        return this.priceConfigRepo.save(config);
    }
    async remove(label) {
        const config = await this.findOne(label);
        return this.priceConfigRepo.remove(config);
    }
};
exports.PriceConfigurationService = PriceConfigurationService;
exports.PriceConfigurationService = PriceConfigurationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(price_configuration_entity_1.PriceConfiguration)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PriceConfigurationService);
//# sourceMappingURL=price-configuration.service.js.map