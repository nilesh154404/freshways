import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { CreateNewOrderDto } from './dto/create-new-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
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
    createNew(createDto: CreateNewOrderDto): Promise<Order>;
    updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order>;
    getOrdersByCustomerId(customerId: number): Promise<Order[]>;
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(customerId?: number, vendorId?: number, communityId?: number, orderStatus?: string, paymentStatus?: string, startDate?: string, endDate?: string, deliveryDate?: string): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    findOneByVendorServicePlan(id: number, customerId: number): Promise<import("../listed-order/entities/listed-order.entity").ListedOrder[]>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    remove(id: string): Promise<void>;
    getOrdersByCustomer(customerId: string): Promise<Order[]>;
    getOrdersByVendor(vendorId: string): Promise<Order[]>;
}
