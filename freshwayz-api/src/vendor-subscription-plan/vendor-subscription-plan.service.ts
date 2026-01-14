import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorSubscriptionPlan } from './entities/vendor-subscription-plan.entity';
import { CreateVendorSubscriptionPlanDto } from './dto/create-vendor-subscription-plan.dto';
import { UpdateVendorSubscriptionPlanDto } from './dto/update-vendor-subscription-plan.dto';

@Injectable()
export class VendorSubscriptionPlanService {
  constructor(
    @InjectRepository(VendorSubscriptionPlan)
    private readonly repo: Repository<VendorSubscriptionPlan>,
  ) {}

  async create(dto: CreateVendorSubscriptionPlanDto) {
    const plan = this.repo.create({
      label: dto.label,
      description: dto.description,
      vendor: { id: dto.vendorId } as any,
    });

    return this.repo.save(plan);
  }

  async findAll() {
    return this.repo.find({ relations: ['vendor'] });
  }

  async findOne(id: number) {
    const plan = await this.repo.findOne({
      where: { id },
      relations: ['vendor'],
    });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async update(id: number, dto: UpdateVendorSubscriptionPlanDto) {
    const plan = await this.findOne(id);

    if (dto.vendorId) plan.vendor = { id: dto.vendorId } as any;

    Object.assign(plan, dto);
    return this.repo.save(plan);
  }

  async remove(id: number) {
    const plan = await this.findOne(id);
    return this.repo.remove(plan);
  }

  // ⭐ EXTRA: Get plan by vendor
  async findByVendor(vendorId: number) {
    const plan = await this.repo.find({
      where: { vendor: { id: vendorId } },
      relations: ['vendor'],
    });

    if (!plan) throw new NotFoundException(`No subscription plan found for vendor ${vendorId}`);
    return plan;
  }
}
