import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { VendorSubscriptionPlan } from 'src/vendor-subscription-plan/entities/vendor-subscription-plan.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,

    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,

    @InjectRepository(VendorSubscriptionPlan)
    private readonly planRepo: Repository<VendorSubscriptionPlan>,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    const customer = await this.customerRepo.findOne({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const plan = await this.planRepo.findOne({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    const existing = await this.subscriptionRepo.findOne({
      where: {
        customer: { id: dto.customerId },
        plan: { id: dto.planId },
        active: true,
      },
    });

    if (existing) {
      throw new BadRequestException('Customer already has an active subscription for this plan');
    }

    const subscription = this.subscriptionRepo.create({
      customer,
      plan,
      active: dto.active ?? true,
    });

    return this.subscriptionRepo.save(subscription);
  }

  findAll() {
    return this.subscriptionRepo.find({
      relations: ['customer', 'plan', 'plan.vendor'],
    });
  }

  async findOne(id: number) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id },
      relations: ['customer', 'plan', 'plan.vendor'],
    });

    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }

  async update(id: number, dto: UpdateSubscriptionDto) {
    const subscription = await this.findOne(id);

    if (dto.active === true) {
      const existing = await this.subscriptionRepo.findOne({
        where: {
          customer: { id: dto.customerId ?? subscription.customer.id },
          plan: { id: dto.planId ?? subscription.plan.id },
          active: true,
        },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          'Customer already has an active subscription for this plan',
        );
      }
    }

    Object.assign(subscription, dto);
    return this.subscriptionRepo.save(subscription);
  }

  async remove(id: number) {
    const subscription = await this.findOne(id);
    return this.subscriptionRepo.remove(subscription);
  }

  // 🔹 New methods
  async findByCustomer(customerId: number, onlyActive = false) {
    return this.subscriptionRepo.find({
      where: {
        customer: { id: customerId },
        ...(onlyActive ? { active: true } : {}),
      },
      relations: ['customer', 'plan', 'plan.vendor'],
    });
  }

  async findByVendor(vendorId: number, onlyActive = false) {
    return this.subscriptionRepo.find({
      where: {
        plan: { vendor: { id: vendorId } },
        ...(onlyActive ? { active: true } : {}),
      },
      relations: ['customer', 'plan', 'plan.vendor'],
    });
  }

  async findByCustomerAndVendor(customerId: number, vendorId: number, onlyActive = false) {
    return this.subscriptionRepo.find({
      where: {
        customer: { id: customerId },
        plan: { vendor: { id: vendorId } },
        ...(onlyActive ? { active: true } : {}),
      },
      relations: ['customer', 'plan', 'plan.vendor'],
    });
  }
}
