import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  private transformToResponse(plan: VendorSubscriptionPlan): any {
    return {
      id: plan.id,
      label: plan.label,
      planName: plan.label, // Alias for frontend compatibility
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      vendorId: plan.vendor?.id,
    };
  }

  async create(dto: CreateVendorSubscriptionPlanDto, user?: any) {
    if (user && user.role?.toLowerCase() === 'vendor') {
      dto.vendorId = user.profileId;
    }

    const plan = this.repo.create({
      label: dto.label,
      description: dto.description,
      price: dto.price || 0,
      duration: dto.duration,
      vendor: { id: dto.vendorId } as any,
    });

    const saved = await this.repo.save(plan);
    return this.transformToResponse(saved);
  }

  async findAll() {
    const plans = await this.repo.find({ relations: ['vendor'] });
    return plans.map(plan => this.transformToResponse(plan));
  }

  async findOne(id: number) {
    const plan = await this.repo.findOne({
      where: { id },
      relations: ['vendor'],
    });
    if (!plan) throw new NotFoundException('Plan not found');
    return this.transformToResponse(plan);
  }

  async update(id: number, dto: UpdateVendorSubscriptionPlanDto, user?: any) {
    const plan = await this.repo.findOne({
      where: { id },
      relations: ['vendor'],
    });
    if (!plan) throw new NotFoundException('Plan not found');

    if (user && user.role?.toLowerCase() === 'vendor') {
      if (!plan.vendor || plan.vendor.id !== user.profileId) {
        throw new ForbiddenException('You can only update your own subscription plans');
      }
    }

    const { vendorId, ...updateData } = dto;
    Object.assign(plan, updateData);

    const saved = await this.repo.save(plan);
    return this.transformToResponse(saved);
  }

  async remove(id: number, user?: any) {
    const plan = await this.repo.findOne({ where: { id }, relations: ['vendor'] });
    if (!plan) throw new NotFoundException('Plan not found');

    if (user && user.role?.toLowerCase() === 'vendor') {
      if (!plan.vendor || plan.vendor.id !== user.profileId) {
        throw new ForbiddenException('You can only delete your own subscription plans');
      }
    }

    return this.repo.remove(plan);
  }

  // ⭐ EXTRA: Get plan by vendor
  async findByVendor(vendorId: number) {
    const plans = await this.repo.find({
      where: { vendor: { id: vendorId } },
      relations: ['vendor'],
    });

    if (!plans || plans.length === 0) {
      return []; // Return empty array instead of throwing error
    }
    return plans.map(plan => this.transformToResponse(plan));
  }
}
