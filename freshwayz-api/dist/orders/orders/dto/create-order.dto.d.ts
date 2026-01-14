import { ListedOrder } from 'src/listed-order/entities/listed-order.entity';
export declare class CreateOrderDto {
    customerId: number;
    vendorId?: number;
    communityId: number;
    deliverySlotId: number;
    deliveryDate?: string;
    grandTotal?: number;
    listedOrders?: ListedOrder[];
}
