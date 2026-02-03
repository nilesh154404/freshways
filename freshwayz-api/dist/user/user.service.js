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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const vendor_entity_1 = require("../vendor/entities/vendor.entity");
const customer_entity_1 = require("../customer/entities/customer.entity");
const product_entity_1 = require("../products/entities/product.entity");
const order_entity_1 = require("../orders/entities/order.entity");
let UserService = class UserService {
    userRepo;
    vendorRepo;
    customerRepo;
    productRepo;
    orderRepo;
    constructor(userRepo, vendorRepo, customerRepo, productRepo, orderRepo) {
        this.userRepo = userRepo;
        this.vendorRepo = vendorRepo;
        this.customerRepo = customerRepo;
        this.productRepo = productRepo;
        this.orderRepo = orderRepo;
    }
    create(createUserDto) {
        return 'This action adds a new user';
    }
    findAll() {
        return `This action returns all user`;
    }
    findOne(id) {
        return `This action returns a #${id} user`;
    }
    update(id, updateUserDto) {
        return `This action updates a #${id} user`;
    }
    remove(id) {
        return `This action removes a #${id} user`;
    }
    async getAdminDashboardStats() {
        const totalProducts = await this.productRepo.count();
        const totalVendors = await this.vendorRepo.count();
        const activeUsers = await this.customerRepo.count();
        const totalSubscriptions = 0;
        const weeklyRevenue = await this.getWeeklyRevenue();
        const weeklyOrders = await this.getWeeklyOrders();
        return {
            totalProducts,
            totalVendors,
            activeUsers,
            totalSubscriptions,
            weeklyRevenue,
            weeklyOrders,
        };
    }
    async getWeeklyRevenue() {
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
                .where('order.createdAt >= :startOfDay', { startOfDay })
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
    async getWeeklyOrders() {
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
                .where('order.createdAt >= :startOfDay', { startOfDay })
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
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(4, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map