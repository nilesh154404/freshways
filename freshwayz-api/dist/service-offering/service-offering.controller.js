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
exports.ServiceOfferingController = void 0;
const common_1 = require("@nestjs/common");
const service_offering_service_1 = require("./service-offering.service");
const create_service_offering_dto_1 = require("./dto/create-service-offering.dto");
const update_service_offering_dto_1 = require("./dto/update-service-offering.dto");
let ServiceOfferingController = class ServiceOfferingController {
    serviceOfferingService;
    constructor(serviceOfferingService) {
        this.serviceOfferingService = serviceOfferingService;
    }
    create(dto) {
        return this.serviceOfferingService.create(dto);
    }
    findAll() {
        return this.serviceOfferingService.findAll();
    }
    findOne(serviceCode) {
        return this.serviceOfferingService.findOne(serviceCode);
    }
    update(serviceCode, dto) {
        return this.serviceOfferingService.update(serviceCode, dto);
    }
    remove(serviceCode) {
        return this.serviceOfferingService.remove(serviceCode);
    }
};
exports.ServiceOfferingController = ServiceOfferingController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_offering_dto_1.CreateServiceOfferingDto]),
    __metadata("design:returntype", void 0)
], ServiceOfferingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServiceOfferingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':serviceCode'),
    __param(0, (0, common_1.Param)('serviceCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceOfferingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':serviceCode'),
    __param(0, (0, common_1.Param)('serviceCode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_service_offering_dto_1.UpdateServiceOfferingDto]),
    __metadata("design:returntype", void 0)
], ServiceOfferingController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':serviceCode'),
    __param(0, (0, common_1.Param)('serviceCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceOfferingController.prototype, "remove", null);
exports.ServiceOfferingController = ServiceOfferingController = __decorate([
    (0, common_1.Controller)('service-offerings'),
    __metadata("design:paramtypes", [service_offering_service_1.ServiceOfferingService])
], ServiceOfferingController);
//# sourceMappingURL=service-offering.controller.js.map