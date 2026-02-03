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
exports.SeederController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vendor_entity_1 = require("../vendor/entities/vendor.entity");
const product_entity_1 = require("../products/entities/product.entity");
const customer_entity_1 = require("../customer/entities/customer.entity");
const user_type_entity_1 = require("../user-type/entities/user-type.entity");
let SeederController = class SeederController {
    vendorRepo;
    productRepo;
    customerRepo;
    userTypeRepo;
    constructor(vendorRepo, productRepo, customerRepo, userTypeRepo) {
        this.vendorRepo = vendorRepo;
        this.productRepo = productRepo;
        this.customerRepo = customerRepo;
        this.userTypeRepo = userTypeRepo;
    }
    async seedDashboardData() {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
        let vendorType = await this.userTypeRepo.findOne({ where: { typeName: 'Vendor' } });
        if (!vendorType)
            vendorType = await this.userTypeRepo.save({ typeName: 'Vendor', description: 'Vendor' });
        let customerType = await this.userTypeRepo.findOne({ where: { typeName: 'Customer' } });
        if (!customerType)
            customerType = await this.userTypeRepo.save({ typeName: 'Customer', description: 'Customer' });
        const vendors = [
            { name: "Organic Harvest", email: "info@organicharvest.com", date: lastMonth },
            { name: "Green Valley Farms", email: "contact@greenvalley.com", date: lastMonth },
            { name: "Fresh Basket", email: "support@freshbasket.com", date: lastMonth },
            { name: "Daily Greens", email: "hello@dailygreens.com", date: now },
        ];
        for (const v of vendors) {
            const existing = await this.vendorRepo.findOne({ where: { email: v.email } });
            if (!existing) {
                const vendor = this.vendorRepo.create({
                    businessName: v.name,
                    email: v.email,
                    ownerName: "Test Owner",
                    userType: vendorType,
                    createdAt: v.date,
                });
                await this.vendorRepo.save(vendor);
                await this.vendorRepo.update({ email: v.email }, { createdAt: v.date });
            }
        }
        const customers = [
            { name: "Alice Johnson", email: "alice@example.com", date: lastMonth },
            { name: "Bob Smith", email: "bob@example.com", date: lastMonth },
            { name: "Charlie Brown", email: "charlie@example.com", date: lastMonth },
            { name: "Diana Prince", email: "diana@example.com", date: lastMonth },
            { name: "Evan Wright", email: "evan@example.com", date: now },
            { name: "Fiona Clark", email: "fiona@example.com", date: now },
        ];
        for (const c of customers) {
            const existing = await this.customerRepo.findOne({ where: { email: c.email } });
            if (!existing) {
                const customer = this.customerRepo.create({
                    fullName: c.name,
                    email: c.email,
                    userType: customerType,
                    createdAt: c.date,
                });
                await this.customerRepo.save(customer);
                await this.customerRepo.update({ email: c.email }, { createdAt: c.date });
            }
        }
        const vendor = await this.vendorRepo.findOne({ where: { email: "info@organicharvest.com" } });
        if (vendor) {
            const products = [
                { label: "Fresh Tomatoes", date: lastMonth },
                { label: "Organic Potatoes", date: lastMonth },
                { label: "Carrots", date: lastMonth },
                { label: "Spinach", date: now },
                { label: "Broccoli", date: now },
            ];
            for (const p of products) {
                const product = this.productRepo.create({
                    label: p.label,
                    description: "Fresh vegetable",
                    productUrl: "http://example.com/img.jpg",
                    measurementUnit: "kg",
                    measurementValue: "1",
                    vendor: vendor,
                    createdAt: p.date
                });
                const saved = await this.productRepo.save(product);
                await this.productRepo.update({ id: saved.id }, { createdAt: p.date });
            }
        }
        return { message: "Seeding complete with backdated data" };
    }
};
exports.SeederController = SeederController;
__decorate([
    (0, common_1.Post)('dashboard-data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeederController.prototype, "seedDashboardData", null);
exports.SeederController = SeederController = __decorate([
    (0, common_1.Controller)('seed'),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(3, (0, typeorm_1.InjectRepository)(user_type_entity_1.UserType)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeederController);
//# sourceMappingURL=seeder.controller.js.map