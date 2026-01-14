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
exports.DailyPriceController = void 0;
const common_1 = require("@nestjs/common");
const daily_price_service_1 = require("./daily-price.service");
const swagger_1 = require("@nestjs/swagger");
const create_daily_price_dto_1 = require("./dto/create-daily-price.dto");
const update_daily_price_dto_1 = require("./dto/update-daily-price.dto");
let DailyPriceController = class DailyPriceController {
    dailyPriceService;
    constructor(dailyPriceService) {
        this.dailyPriceService = dailyPriceService;
    }
    create(dto) {
        return this.dailyPriceService.create(dto);
    }
    findAll() {
        return this.dailyPriceService.findAll();
    }
    findOne(id) {
        return this.dailyPriceService.findOne(+id);
    }
    update(id, dto) {
        return this.dailyPriceService.update(+id, dto);
    }
    remove(id) {
        return this.dailyPriceService.remove(+id);
    }
};
exports.DailyPriceController = DailyPriceController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create daily price' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Daily price created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_daily_price_dto_1.CreateDailyPriceDto]),
    __metadata("design:returntype", void 0)
], DailyPriceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all daily prices' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DailyPriceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single daily price by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DailyPriceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update daily price' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_daily_price_dto_1.UpdateDailyPriceDto]),
    __metadata("design:returntype", void 0)
], DailyPriceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete daily price' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DailyPriceController.prototype, "remove", null);
exports.DailyPriceController = DailyPriceController = __decorate([
    (0, swagger_1.ApiTags)('Daily Price'),
    (0, common_1.Controller)('daily-price'),
    __metadata("design:paramtypes", [daily_price_service_1.DailyPriceService])
], DailyPriceController);
//# sourceMappingURL=daily-price.controller.js.map