import { Repository } from 'typeorm';
import { CreateDeliverySlotDto } from './dto/create-delivery-slot.dto';
import { UpdateDeliverySlotDto } from './dto/update-delivery-slot.dto';
import { DeliverySlot } from './entities/delivery-slot.entity';
export declare class DeliverySlotsService {
    private readonly slotRepository;
    constructor(slotRepository: Repository<DeliverySlot>);
    create(dto: CreateDeliverySlotDto): Promise<DeliverySlot>;
    findAll(): Promise<DeliverySlot[]>;
    findOne(id: number): Promise<DeliverySlot>;
    findOneByVendorSubscriptionPlanId(id: number): Promise<DeliverySlot[]>;
    update(id: number, dto: UpdateDeliverySlotDto): Promise<DeliverySlot>;
    remove(id: number): Promise<DeliverySlot>;
}
