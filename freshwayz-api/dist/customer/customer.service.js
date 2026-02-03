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
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_entity_1 = require("./entities/customer.entity");
const typeorm_2 = require("typeorm");
let CustomerService = class CustomerService {
    customerRepository;
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    create(createCustomerDto) {
        return 'This action adds a new customer';
    }
    findAll() {
        return `This action returns all customer`;
    }
    async getCustomersCount() {
        const total = await this.customerRepository.count();
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const newThisMonth = await this.customerRepository.count({
            where: {
                createdAt: (0, typeorm_2.MoreThanOrEqual)(firstDayCurrentMonth),
            }
        });
        const newLastMonth = await this.customerRepository.count({
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
    findOne(id) {
        return `This action returns a #${id} customer`;
    }
    async updateCustomer(id, updateCustomerDto) {
        const customer = await this.customerRepository.findOne({
            where: { id },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        Object.assign(customer, updateCustomerDto);
        return this.customerRepository.save(customer);
    }
    remove(id) {
        return `This action removes a #${id} customer`;
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomerService);
//# sourceMappingURL=customer.service.js.map