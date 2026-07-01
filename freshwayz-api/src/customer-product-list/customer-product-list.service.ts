import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CustomerProduct } from './entities/customer-product.entity';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { UpdateCustomerProductDto } from './dto/update-customer-product.dto';

import { Customer } from '../customer/entities/customer.entity';
import { VendorSubscriptionPlan } from '../vendor-subscription-plan/entities/vendor-subscription-plan.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CustomerProductListService {
  constructor(
    @InjectRepository(CustomerProduct)
    private readonly customerProductRepo: Repository<CustomerProduct>,

    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(VendorSubscriptionPlan)
    private readonly planRepo: Repository<VendorSubscriptionPlan>,
  ) {}

  // CREATE
  async create(dto: CreateCustomerProductDto) {
    const customer = await this.customerRepo.findOneBy({ id: dto.customerId });
    if (!customer) throw new NotFoundException('Customer not found');

    const plan = await this.planRepo.findOneBy({
      id: dto.vendorSubscriptionPlanId,
    });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    let product: Product | null = null;
    if (dto.productId != null) {
      product = await this.productRepo.findOneBy({ id: dto.productId });
      if (!product) throw new NotFoundException('Product not found');
    }

    const customerProduct = this.customerProductRepo.create({
      customer,
      vendorSubscriptionPlan: plan,
      product,

      productName: dto.productName ?? null,
      quantity: dto.quantity ?? null,
      amount: dto.amount ?? null,
      notes: dto.notes ?? null,
    });

    return this.customerProductRepo.save(customerProduct);
  }

  // GET BY CUSTOMER
  async getByCustomerId(customerId: number) {
    return this.customerProductRepo.find({
      where: {
        customer: { id: customerId },
      },
      relations: [
        'customer',
        'vendorSubscriptionPlan',
        'vendorSubscriptionPlan.vendor',
        'product',
        'product.dailyPrices',
      ],
      order: { id: 'DESC' },
    });
  }

  // UPDATE
  async update(id: number, dto: UpdateCustomerProductDto) {
    const record = await this.customerProductRepo.findOneBy({ id });
    if (!record) throw new NotFoundException('Customer product not found');

    if (dto.vendorSubscriptionPlanId != null) {
      const plan = await this.planRepo.findOneBy({ id: dto.vendorSubscriptionPlanId });
      if (!plan) throw new NotFoundException('Subscription plan not found');
      record.vendorSubscriptionPlan = plan;
    }

    if (dto.productId !== undefined) {
      if (dto.productId === null) {
        record.product = null;
      } else {
        const product = await this.productRepo.findOneBy({ id: dto.productId });
        if (!product) throw new NotFoundException('Product not found');
        record.product = product;
      }
    }

    if (dto.productName !== undefined) record.productName = dto.productName;
    if (dto.quantity !== undefined) record.quantity = dto.quantity;
    if (dto.amount !== undefined) record.amount = dto.amount;
    if (dto.notes !== undefined) record.notes = dto.notes;

    return this.customerProductRepo.save(record);
  }

  // DELETE
  async deleteById(id: number) {
    const record = await this.customerProductRepo.findOneBy({ id });
    if (!record) throw new NotFoundException('Customer product not found');
    return this.customerProductRepo.remove(record);
  }
}
