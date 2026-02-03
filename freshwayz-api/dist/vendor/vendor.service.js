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
const categories_entity_1 = require("../categories/categories.entity");
const user_type_entity_1 = require("../user-type/entities/user-type.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const product_entity_1 = require("../products/entities/product.entity");
let VendorService = class VendorService {
    vendorRepo;
    categoriesRepo;
    userTypeRepo;
    orderRepo;
    productRepo;
    constructor(vendorRepo, categoriesRepo, userTypeRepo, orderRepo, productRepo) {
        this.vendorRepo = vendorRepo;
        this.categoriesRepo = categoriesRepo;
        this.userTypeRepo = userTypeRepo;
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
    }
    async findAll() {
        return this.vendorRepo.find({
            relations: ['userType', 'orders', 'dailyPrice', 'vendorSubscriptionPlan', 'categories'],
        });
    }
    async findOne(id) {
        const vendor = await this.vendorRepo.findOne({
            where: { id },
            relations: ['userType', 'products',
                'vendorSubscriptionPlan', 'categories'],
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return vendor;
    }
    async update(id, updateData) {
        const vendor = await this.findOne(id);
        Object.assign(vendor, updateData);
        if (updateData.userTypeId) {
            const userType = await this.userTypeRepo.findOne({ where: { id: updateData.userTypeId } });
            if (!userType)
                throw new common_1.NotFoundException('User Type not found');
            vendor.userType = userType;
        }
        return this.vendorRepo.save(vendor);
    }
    async updateProfile(id, updateData) {
        const vendor = await this.findOne(id);
        if (updateData.ownerName !== undefined) {
            vendor.ownerName = updateData.ownerName;
        }
        if (updateData.address !== undefined) {
            vendor.address = updateData.address;
        }
        if (updateData.website !== undefined) {
            vendor.website = updateData.website;
        }
        if (updateData.categories) {
            const categories = await this.categoriesRepo.findBy({ id: (0, typeorm_2.In)(updateData.categories) });
            vendor.categories = categories;
        }
        return this.vendorRepo.save(vendor);
    }
    async remove(id) {
        const vendor = await this.findOne(id);
        await this.vendorRepo.remove(vendor);
        return { message: 'Vendor removed successfully' };
    }
    async getDashboardStats(vendorId) {
        const totalProducts = await this.productRepo.count({ where: { vendor: { id: vendorId } } });
        const activeProducts = await this.productRepo.count({
            where: { vendor: { id: vendorId } }
        });
        const totalOrders = await this.orderRepo.count({ where: { vendor: { id: vendorId } } });
        const orders = await this.orderRepo.find({
            where: { vendor: { id: vendorId } },
            select: ['grandTotal']
        });
        const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.grandTotal) || 0), 0);
        const weeklyRevenue = await this.getWeeklyRevenue(vendorId);
        const weeklyOrders = await this.getWeeklyOrders(vendorId);
        return {
            totalProducts,
            activeProducts,
            totalOrders,
            totalRevenue,
            weeklyRevenue,
            weeklyOrders,
        };
    }
    async getWeeklyRevenue(vendorId) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));
            const orders = await this.orderRepo
                .createQueryBuilder('order')
                .where('order.vendorId = :vendorId', { vendorId })
                .andWhere('order.createdAt >= :startOfDay', { startOfDay })
                .andWhere('order.createdAt <= :endOfDay', { endOfDay })
                .getMany();
            const revenue = orders.reduce((sum, order) => sum + (Number(order.grandTotal) || 0), 0);
            weeklyData.push({
                name: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
                revenue: Math.round(revenue),
            });
        }
        return weeklyData;
    }
    async getWeeklyOrders(vendorId) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));
            const orders = await this.orderRepo
                .createQueryBuilder('order')
                .where('order.vendorId = :vendorId', { vendorId })
                .andWhere('order.createdAt >= :startOfDay', { startOfDay })
                .andWhere('order.createdAt <= :endOfDay', { endOfDay })
                .getCount();
            weeklyData.push({
                name: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
                orders,
            });
        }
        return weeklyData;
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(1, (0, typeorm_1.InjectRepository)(categories_entity_1.Categories)),
    __param(2, (0, typeorm_1.InjectRepository)(user_type_entity_1.UserType)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(4, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], VendorService);
//# sourceMappingURL=vendor.service.js.map