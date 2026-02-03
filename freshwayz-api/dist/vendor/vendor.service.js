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
exports.VendorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vendor_entity_1 = require("./entities/vendor.entity");
const user_type_entity_1 = require("../user-type/entities/user-type.entity");
let VendorService = class VendorService {
    vendorRepo;
    userTypeRepo;
    constructor(vendorRepo, userTypeRepo) {
        this.vendorRepo = vendorRepo;
        this.userTypeRepo = userTypeRepo;
    }
    async findAll() {
        return this.vendorRepo.find({
            relations: ['userType', 'orders', 'dailyPrice', 'vendorSubscriptionPlan'],
        });
    }
    async getVendorsCount() {
        const total = await this.vendorRepo.count();
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const newThisMonth = await this.vendorRepo.count({
            where: {
                createdAt: (0, typeorm_2.MoreThanOrEqual)(firstDayCurrentMonth),
            }
        });
        const newLastMonth = await this.vendorRepo.count({
            where: {
                createdAt: (0, typeorm_2.Between)(firstDayLastMonth, lastDayLastMonth),
            }
        });
        let growth = 0;
        if (newLastMonth > 0) {
            growth = ((newThisMonth - newLastMonth) / newLastMonth) * 100;
        }
        else if (newThisMonth > 0) {
            growth = 100;
        }
        return { total, growth: Math.round(growth), newThisMonth };
    }
    async findOne(id) {
        const vendor = await this.vendorRepo.findOne({
            where: { id },
            relations: ['userType', 'products', 'categories', 'vendorSubscriptionPlan'],
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return vendor;
    }
    async update(id, updateData) {
        const vendor = await this.findOne(id);
        const { categories, ...rest } = updateData;
        Object.assign(vendor, rest);
        if (updateData.userTypeId) {
            const userType = await this.userTypeRepo.findOne({ where: { id: updateData.userTypeId } });
            if (!userType)
                throw new common_1.NotFoundException('User Type not found');
            vendor.userType = userType;
        }
        if (categories) {
            vendor.categories = categories.map(id => ({ id }));
        }
        return this.vendorRepo.save(vendor);
    }
    async remove(id) {
        const vendor = await this.findOne(id);
        await this.vendorRepo.remove(vendor);
        return { message: 'Vendor removed successfully' };
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(1, (0, typeorm_1.InjectRepository)(user_type_entity_1.UserType)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], VendorService);
//# sourceMappingURL=vendor.service.js.map