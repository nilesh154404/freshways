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
exports.ServiceOfferingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_offering_entity_1 = require("./entities/service-offering.entity");
let ServiceOfferingService = class ServiceOfferingService {
    serviceOfferingRepo;
    constructor(serviceOfferingRepo) {
        this.serviceOfferingRepo = serviceOfferingRepo;
    }
    create(dto) {
        const serviceOffering = this.serviceOfferingRepo.create(dto);
        return this.serviceOfferingRepo.save(serviceOffering);
    }
    findAll() {
        return this.serviceOfferingRepo.find({
            relations: ['products'],
        });
    }
    async findOne(serviceCode) {
        const item = await this.serviceOfferingRepo.findOne({
            where: { serviceCode },
            relations: ['products'],
        });
        if (!item) {
            throw new common_1.NotFoundException('Service offering not found');
        }
        return item;
    }
    async update(serviceCode, dto) {
        const item = await this.findOne(serviceCode);
        Object.assign(item, dto);
        return this.serviceOfferingRepo.save(item);
    }
    async remove(serviceCode) {
        const item = await this.findOne(serviceCode);
        return this.serviceOfferingRepo.remove(item);
    }
};
exports.ServiceOfferingService = ServiceOfferingService;
exports.ServiceOfferingService = ServiceOfferingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_offering_entity_1.ServiceOffering)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ServiceOfferingService);
//# sourceMappingURL=service-offering.service.js.map