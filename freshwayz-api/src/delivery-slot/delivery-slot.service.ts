// delivery-slots.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeliverySlotDto } from './dto/create-delivery-slot.dto';
import { UpdateDeliverySlotDto } from './dto/update-delivery-slot.dto';
import { DeliverySlot } from './entities/delivery-slot.entity';

@Injectable()
export class DeliverySlotsService {
  constructor(
    @InjectRepository(DeliverySlot)
    private readonly slotRepository: Repository<DeliverySlot>,
  ) { }

  create(dto: CreateDeliverySlotDto) {
    const slot = this.slotRepository.create(dto);
    if (dto.planId) {
      slot.vendorSubscriptionPlan = { id: dto.planId } as any;
    }
    return this.slotRepository.save(slot);
  }

  findAll() {
    return this.slotRepository.find({ order: { date: 'ASC' } });
  }

  async findOne(id: number) {
    const slot = await this.slotRepository.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('Delivery slot not found');
    return slot;
  }


  async findOneByVendorSubscriptionPlanId(id: number) {
    const slot = await this.slotRepository.find({ where: { vendorSubscriptionPlan: { id } } });
    if (!slot) throw new NotFoundException('Delivery slot not found');
    return slot;
  }

  async update(id: number, dto: UpdateDeliverySlotDto) {
    const slot = await this.findOne(id);
    Object.assign(slot, dto);
    return this.slotRepository.save(slot);
  }

  async remove(id: number) {
    const slot = await this.findOne(id);
    return this.slotRepository.remove(slot);
  }
}
