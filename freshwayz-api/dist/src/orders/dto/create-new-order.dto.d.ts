import { CreateListedOrderDto } from 'src/listed-order/dto/create-listed-order.dto';
export declare class CreateNewOrderDto {
    customerId: number;
    vendorId?: number;
    communityId: number;
    deliveryDate?: string;
    deliverySlotId: number;
    vendorSubscriptionPlanId: number;
    grandTotal?: number;
    listedOrders?: CreateListedOrderDto[];
}
