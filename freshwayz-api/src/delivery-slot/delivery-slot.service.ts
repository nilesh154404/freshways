// delivery-slots.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeliverySlotDto } from './dto/create-delivery-slot.dto';
import { UpdateDeliverySlotDto } from './dto/update-delivery-slot.dto';
import { DeliverySlot } from './entities/delivery-slot.entity';
import { VendorSubscriptionPlan } from 'src/vendor-subscription-plan/entities/vendor-subscription-plan.entity';

@Injectable()
export class DeliverySlotsService {
  constructor(
    @InjectRepository(DeliverySlot)
    private readonly slotRepository: Repository<DeliverySlot>,
  ) { }

  async create(dto: CreateDeliverySlotDto, user?: any) {
    if (dto.planId) {
      const plan = await this.slotRepository.manager.getRepository(VendorSubscriptionPlan).findOne({
        where: { id: dto.planId },
        relations: ['vendor'],
      });
      if (user && user.role?.toLowerCase() === 'vendor') {
        if (!plan) throw new NotFoundException('Vendor subscription plan not found');
        if (plan.vendor && plan.vendor.id !== user.profileId) {
          throw new ForbiddenException('You can only create delivery slots for your own subscription plan');
        }
      }
    }

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

  async update(id: number, dto: UpdateDeliverySlotDto, user?: any) {
    const slot = await this.slotRepository.findOne({
      where: { id },
      relations: ['vendorSubscriptionPlan', 'vendorSubscriptionPlan.vendor'],
    });
    if (!slot) throw new NotFoundException('Delivery slot not found');

    if (user && user.role?.toLowerCase() === 'vendor') {
      if (slot.vendorSubscriptionPlan?.vendor && slot.vendorSubscriptionPlan.vendor.id !== user.profileId) {
        throw new ForbiddenException('You can only update delivery slots for your own subscription plan');
      }
    }

    Object.assign(slot, dto);
    return this.slotRepository.save(slot);
  }

  async remove(id: number, user?: any) {
    const slot = await this.slotRepository.findOne({
      where: { id },
      relations: ['vendorSubscriptionPlan', 'vendorSubscriptionPlan.vendor'],
    });
    if (!slot) throw new NotFoundException('Delivery slot not found');

    if (user && user.role?.toLowerCase() === 'vendor') {
      if (slot.vendorSubscriptionPlan?.vendor && slot.vendorSubscriptionPlan.vendor.id !== user.profileId) {
        throw new ForbiddenException('You can only delete delivery slots for your own subscription plan');
      }
    }

    return this.slotRepository.remove(slot);
  }
}
