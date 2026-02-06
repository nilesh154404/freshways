import { CreateDeliverySlotDto } from './dto/create-delivery-slot.dto';
import { UpdateDeliverySlotDto } from './dto/update-delivery-slot.dto';
import { DeliverySlot } from './entities/delivery-slot.entity';
import { DeliverySlotsService } from './delivery-slot.service';
export declare class DeliverySlotsController {
    private readonly service;
    constructor(service: DeliverySlotsService);
    create(dto: CreateDeliverySlotDto): Promise<DeliverySlot>;
    findAll(): Promise<DeliverySlot[]>;
    findOne(id: number): Promise<DeliverySlot>;
    findOneByVendorSubscriptionPlanId(id: number): Promise<DeliverySlot[]>;
    update(id: number, dto: UpdateDeliverySlotDto): Promise<DeliverySlot>;
    remove(id: number): Promise<DeliverySlot>;
}
