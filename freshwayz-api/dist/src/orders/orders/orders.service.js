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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const customer_entity_1 = require("../../customer/entities/customer.entity");
const vendor_entity_1 = require("../../vendor/entities/vendor.entity");
const community_entity_1 = require("../../community/entities/community.entity");
const listed_order_entity_1 = require("../../listed-order/entities/listed-order.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const delivery_slot_entity_1 = require("../../delivery-slot/entities/delivery-slot.entity");
const vendor_subscription_plan_entity_1 = require("../../vendor-subscription-plan/entities/vendor-subscription-plan.entity");
const product_discount_service_1 = require("../../product-discount/product-discount.service");
const daily_price_entity_1 = require("../../daily-price/entities/daily-price.entity");
let OrderService = class OrderService {
    orderRepo;
    customerRepo;
    vendorRepo;
    communityRepo;
    listedOrderRepo;
    deliverySlotRepo;
    vendorSubscriptionPlanRepo;
    dailyPriceRepo;
    productRepo;
    discountService;
    constructor(orderRepo, customerRepo, vendorRepo, communityRepo, listedOrderRepo, deliverySlotRepo, vendorSubscriptionPlanRepo, dailyPriceRepo, productRepo, discountService) {
        this.orderRepo = orderRepo;
        this.customerRepo = customerRepo;
        this.vendorRepo = vendorRepo;
        this.communityRepo = communityRepo;
        this.listedOrderRepo = listedOrderRepo;
        this.deliverySlotRepo = deliverySlotRepo;
        this.vendorSubscriptionPlanRepo = vendorSubscriptionPlanRepo;
        this.dailyPriceRepo = dailyPriceRepo;
        this.productRepo = productRepo;
        this.discountService = discountService;
    }
    async createNew(createDto) {
        const { customerId, vendorId, vendorSubscriptionPlanId, communityId, listedOrders, deliveryDate, deliverySlotId } = createDto;
        console.log(createDto);
        const customer = await this.customerRepo.findOne({ where: { id: customerId } });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const vendor = vendorId
            ? await this.vendorRepo.findOne({ where: { id: vendorId } })
            : null;
        if (vendorId && !vendor)
            throw new common_1.NotFoundException('Vendor not found');
        const community = await this.communityRepo.findOne({
            where: { id: communityId },
        });
        if (!community)
            throw new common_1.NotFoundException('Community not found');
        if (!community)
            throw new common_1.NotFoundException('Community not found');
        const deliverySlot = await this.deliverySlotRepo.findOneBy({ id: deliverySlotId });
        let vendorSubscriptionPlan;
        if (vendorSubscriptionPlanId) {
            vendorSubscriptionPlan =
                await this.vendorSubscriptionPlanRepo.findOneBy({
                    id: vendorSubscriptionPlanId,
                }) ?? undefined;
        }
        const order = this.orderRepo.create({
            customer,
            vendor,
            community,
            deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            grandTotal: createDto.grandTotal || 0,
            deliverySlot,
            listedOrders: [],
            vendorSubscriptionPlan
        });
        let total = 0;
        const now = new Date();
        if (listedOrders && listedOrders.length > 0) {
            for (const item of listedOrders) {
                const listedOrder = new listed_order_entity_1.ListedOrder();
                listedOrder.order = order;
                listedOrder.notes = item.notes || null;
                listedOrder.productName = item.productName ?? null;
                listedOrder.quantity = item.quantity ?? null;
                if (!item.productId) {
                    throw new common_1.BadRequestException('Product ID is required in listedOrders');
                }
                const product = await this.productRepo.findOne({
                    where: { id: item.productId },
                    relations: ['discounts'],
                });
                if (!product)
                    throw new common_1.NotFoundException(`Product ID ${item.productId} not found`);
                listedOrder.product = product;
                const dailyPrice = await this.dailyPriceRepo.findOne({
                    where: { product: { id: item.productId }, isActive: true },
                });
                if (!dailyPrice)
                    throw new common_1.NotFoundException(`Active price for product ${item.productId} not found`);
                const basePrice = Number(dailyPrice.amount);
                listedOrder.amount = basePrice;
                const activeDiscount = product.discounts.find(d => d.isActive &&
                    d.startDate <= now &&
                    d.endDate >= now &&
                    (item.quantity ?? 0) >= (d.minCartQuantity ?? 0));
                if (activeDiscount && item.quantity) {
                    const discountResult = this.discountService.calculatePrice(basePrice, item.quantity, activeDiscount);
                    listedOrder.discountedAmount = discountResult.finalTotal ?? null;
                    listedOrder.productDiscount = activeDiscount;
                }
                else {
                    listedOrder.discountedAmount = basePrice * (item.quantity ?? 1);
                    listedOrder.productDiscount = null;
                }
                total += listedOrder.discountedAmount ?? 0;
                order.listedOrders.push(listedOrder);
            }
        }
        order.grandTotal = createDto.grandTotal ?? total;
        return this.orderRepo.save(order);
    }
    async updateStatus(orderId, dto) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        }
        order.orderStatus = dto.status;
        return this.orderRepo.save(order);
    }
    async findByCustomerId(customerId) {
        const orders = await this.orderRepo.find({
            where: { customer: { id: customerId } },
            relations: ['customer', 'vendor', 'listedOrders.product', 'deliverySlot', 'community', 'listedOrders', 'payments'],
            order: { createdAt: 'DESC' },
        });
        if (!orders || orders.length === 0) {
            throw new common_1.NotFoundException(`No orders found for customer ID ${customerId}`);
        }
        return orders;
    }
    async create(createOrderDto) {
        const { customerId, vendorId, communityId, listedOrders, deliveryDate, grandTotal, deliverySlotId } = createOrderDto;
        const customer = await this.customerRepo.findOneBy({ id: customerId });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        let vendor = null;
        if (vendorId) {
            vendor = await this.vendorRepo.findOneBy({ id: vendorId });
            if (!vendor)
                throw new common_1.NotFoundException('Vendor not found');
        }
        let deliverySlot = null;
        if (deliverySlotId) {
            deliverySlot = await this.deliverySlotRepo.findOneBy({ id: deliverySlotId });
            if (!vendor)
                throw new common_1.NotFoundException('Vendor not found');
        }
        const community = await this.communityRepo.findOneBy({ id: communityId });
        if (!community)
            throw new common_1.NotFoundException('Community not found');
        const order = this.orderRepo.create({
            customer,
            vendor,
            community,
            deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            grandTotal: grandTotal || 0,
            deliverySlot
        });
        const savedOrder = await this.orderRepo.save(order);
        if (listedOrders?.length) {
            const orders = listedOrders.map(lo => this.listedOrderRepo.create({ ...lo, order: savedOrder }));
            await this.listedOrderRepo.save(orders);
            savedOrder.listedOrders = orders;
        }
        return savedOrder;
    }
    async findAll(filters) {
        const qb = this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.vendor', 'vendor')
            .leftJoinAndSelect('order.community', 'community')
            .leftJoinAndSelect('order.listedOrders', 'listedOrders')
            .leftJoinAndSelect('listedOrders.product', 'product')
            .leftJoinAndSelect('order.payments', 'payments')
            .where('order.isDeleted = false');
        if (filters.customerId) {
            qb.andWhere('order.customerId = :customerId', { customerId: filters.customerId });
        }
        if (filters.vendorId) {
            qb.andWhere('order.vendorId = :vendorId', { vendorId: filters.vendorId });
        }
        if (filters.communityId) {
            qb.andWhere('order.communityId = :communityId', { communityId: filters.communityId });
        }
        if (filters.orderStatus) {
            qb.andWhere('order.orderStatus = :orderStatus', { orderStatus: filters.orderStatus });
        }
        if (filters.paymentStatus) {
            qb.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: filters.paymentStatus });
        }
        if (filters.startDate) {
            qb.andWhere('order.createdAt >= :startDate', { startDate: filters.startDate });
        }
        if (filters.endDate) {
            qb.andWhere('order.createdAt <= :endDate', { endDate: filters.endDate });
        }
        if (filters.deliveryDate) {
            qb.andWhere('order.deliveryDate = :deliveryDate', { deliveryDate: filters.deliveryDate });
        }
        qb.orderBy('order.createdAt', 'DESC');
        return qb.getMany();
    }
    async findOne(id) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['customer', 'vendor', 'community', 'listedOrders', 'payments'],
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async update(id, updateOrderDto) {
        const order = await this.findOne(id);
        Object.assign(order, updateOrderDto);
        return this.orderRepo.save(order);
    }
    async remove(id) {
        const order = await this.findOne(id);
        order.isDeleted = true;
        await this.orderRepo.save(order);
    }
    async getOrdersByCustomer(customerId) {
        return this.orderRepo.find({
            where: { customer: { id: customerId }, isDeleted: false },
            relations: ['vendor', 'community', 'listedOrders', 'payments'],
        });
    }
    async getOrdersByVendor(vendorId) {
        return this.orderRepo.find({
            where: { vendor: { id: vendorId }, isDeleted: false },
            relations: ['customer', 'community', 'listedOrders', 'payments'],
        });
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(2, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(3, (0, typeorm_1.InjectRepository)(community_entity_1.Community)),
    __param(4, (0, typeorm_1.InjectRepository)(listed_order_entity_1.ListedOrder)),
    __param(5, (0, typeorm_1.InjectRepository)(delivery_slot_entity_1.DeliverySlot)),
    __param(6, (0, typeorm_1.InjectRepository)(vendor_subscription_plan_entity_1.VendorSubscriptionPlan)),
    __param(7, (0, typeorm_1.InjectRepository)(daily_price_entity_1.DailyPrice)),
    __param(8, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        product_discount_service_1.ProductDiscountService])
], OrderService);
//# sourceMappingURL=orders.service.js.map