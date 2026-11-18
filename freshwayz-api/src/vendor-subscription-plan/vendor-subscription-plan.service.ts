import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorSubscriptionPlan } from './entities/vendor-subscription-plan.entity';
import { CreateVendorSubscriptionPlanDto } from './dto/create-vendor-subscription-plan.dto';
import { UpdateVendorSubscriptionPlanDto } from './dto/update-vendor-subscription-plan.dto';
import { paginate, PaginatedResponse } from 'src/helpers/pagination/pagination';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

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

  async findAll(dto?: RangeDTO): Promise<PaginatedResponse<any>> {
    const qb = this.repo.createQueryBuilder('plan')
      .leftJoinAndSelect('plan.vendor', 'vendor')
      .orderBy('plan.id', 'DESC');

    const result = await paginate(qb, dto);
    return {
      data: result.data.map(plan => this.transformToResponse(plan)),
      pagination: result.pagination,
    };
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
  async findByVendor(vendorId: number, dto?: RangeDTO): Promise<PaginatedResponse<any>> {
    const qb = this.repo.createQueryBuilder('plan')
      .leftJoinAndSelect('plan.vendor', 'vendor')
      .where('plan.vendor = :vendorId', { vendorId })
      .orderBy('plan.id', 'DESC');

    const result = await paginate(qb, dto);
    return {
      data: result.data.map(plan => this.transformToResponse(plan)),
      pagination: result.pagination,
    };
  }
}
