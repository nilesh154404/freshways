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
exports.PriceConfigurationController = void 0;
const common_1 = require("@nestjs/common");
const price_configuration_service_1 = require("./price-configuration.service");
const create_price_configuration_dto_1 = require("./dto/create-price-configuration.dto");
const update_price_configuration_dto_1 = require("./dto/update-price-configuration.dto");
let PriceConfigurationController = class PriceConfigurationController {
    priceConfigurationService;
    constructor(priceConfigurationService) {
        this.priceConfigurationService = priceConfigurationService;
    }
    create(dto) {
        return this.priceConfigurationService.create(dto);
    }
    findAll() {
        return this.priceConfigurationService.findAll();
    }
    findOne(label) {
        return this.priceConfigurationService.findOne(label);
    }
    update(label, dto) {
        return this.priceConfigurationService.update(label, dto);
    }
    remove(label) {
        return this.priceConfigurationService.remove(label);
    }
};
exports.PriceConfigurationController = PriceConfigurationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_price_configuration_dto_1.CreatePriceConfigurationDto]),
    __metadata("design:returntype", void 0)
], PriceConfigurationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PriceConfigurationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':label'),
    __param(0, (0, common_1.Param)('label')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PriceConfigurationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':label'),
    __param(0, (0, common_1.Param)('label')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_price_configuration_dto_1.UpdatePriceConfigurationDto]),
    __metadata("design:returntype", void 0)
], PriceConfigurationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':label'),
    __param(0, (0, common_1.Param)('label')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PriceConfigurationController.prototype, "remove", null);
exports.PriceConfigurationController = PriceConfigurationController = __decorate([
    (0, common_1.Controller)('price-configurations'),
    __metadata("design:paramtypes", [price_configuration_service_1.PriceConfigurationService])
], PriceConfigurationController);
//# sourceMappingURL=price-configuration.controller.js.map