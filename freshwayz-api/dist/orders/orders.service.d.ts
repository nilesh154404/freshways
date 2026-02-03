import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Community } from 'src/community/entities/community.entity';
import { ListedOrder } from 'src/listed-order/entities/listed-order.entity';
import { CreateNewOrderDto } from './dto/create-new-order.dto';
import { Product } from 'src/products/entities/product.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { DeliverySlot } from 'src/delivery-slot/entities/delivery-slot.entity';
import { VendorSubscriptionPlan } from 'src/vendor-subscription-plan/entities/vendor-subscription-plan.entity';
import { ProductDiscountService } from 'src/product-discount/product-discount.service';
import { DailyPrice } from 'src/daily-price/entities/daily-price.entity';
interface OrderFilter {
    customerId?: number;
    vendorId?: number;
    communityId?: number;
    orderStatus?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    deliveryDate?: string;
}
export declare class OrderService {
    private readonly orderRepo;
    private readonly customerRepo;
    private readonly vendorRepo;
    private readonly communityRepo;
    private readonly listedOrderRepo;
    private readonly deliverySlotRepo;
    private readonly vendorSubscriptionPlanRepo;
    private readonly dailyPriceRepo;
    private readonly productRepo;
    private readonly discountService;
    constructor(orderRepo: Repository<Order>, customerRepo: Repository<Customer>, vendorRepo: Repository<Vendor>, communityRepo: Repository<Community>, listedOrderRepo: Repository<ListedOrder>, deliverySlotRepo: Repository<DeliverySlot>, vendorSubscriptionPlanRepo: Repository<VendorSubscriptionPlan>, dailyPriceRepo: Repository<DailyPrice>, productRepo: Repository<Product>, discountService: ProductDiscountService);
    createNew(createDto: CreateNewOrderDto): Promise<Order>;
    updateStatus(orderId: number, dto: UpdateOrderStatusDto): Promise<Order>;
    findByCustomerId(customerId: number): Promise<Order[]>;
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(filters: OrderFilter): Promise<Order[]>;
    findOne(id: number): Promise<Order>;
    findOneByVendorServicePlan(id: number, customerId: number): Promise<ListedOrder[]>;
    update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order>;
    remove(id: number): Promise<void>;
    getOrdersByCustomer(customerId: number): Promise<Order[]>;
    getOrdersByVendor(vendorId: number): Promise<Order[]>;
    getWeeklyStats(vendorId?: number): Promise<{
        revenueData: {
            name: string;
            revenue: number;
        }[];
        ordersData: {
            name: string;
            orders: number;
        }[];
    }>;
}
export {};
