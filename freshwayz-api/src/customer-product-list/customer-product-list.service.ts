import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { CustomerProduct } from './entities/customer-product.entity';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { UpdateCustomerProductDto } from './dto/update-customer-product.dto';

import { Customer } from '../customer/entities/customer.entity';
import { VendorSubscriptionPlan } from '../vendor-subscription-plan/entities/vendor-subscription-plan.entity';
import { Product } from '../products/entities/product.entity';
import { ProductCustomizationOption } from '../products/entities/product-customization-option.entity';
import { DailyPrice } from '../daily-price/entities/daily-price.entity';

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

    @InjectRepository(ProductCustomizationOption)
    private readonly customOptionRepo: Repository<ProductCustomizationOption>,

    @InjectRepository(DailyPrice)
    private readonly dailyPriceRepo: Repository<DailyPrice>,
  ) {}

  // CREATE
  async create(dto: CreateCustomerProductDto) {
    const customer = await this.customerRepo.findOneBy({ id: dto.customerId });
    if (!customer) throw new NotFoundException('Customer not found');

    let plan: VendorSubscriptionPlan | null = null;
    if (dto.vendorSubscriptionPlanId != null) {
      plan = await this.planRepo.findOne({
        where: { id: dto.vendorSubscriptionPlanId },
        relations: ['vendor']
      });
      if (!plan) throw new NotFoundException('Subscription plan not found');
    }

    let product: Product | null = null;
    let basePrice = 0;
    if (dto.productId != null) {
      product = await this.productRepo.findOneBy({ id: dto.productId });
      if (!product) throw new NotFoundException('Product not found');
      
      // Fetch base product price (dailyPrice)
      const whereCondition: any = { product: { id: product.id }, isActive: true };
      if (plan && plan.vendor) {
        whereCondition.vendor = { id: plan.vendor.id };
      }
      const dailyPrice = await this.dailyPriceRepo.findOne({
        where: whereCondition,
        order: { id: 'DESC' }
      });
      if (dailyPrice) {
        basePrice = Number(dailyPrice.amount);
      }
    }

    let finalAmount = basePrice;
    
    // Process customization options
    if (dto.customizationOptionIds && dto.customizationOptionIds.length > 0 && product) {
      const options = await this.customOptionRepo.find({
        where: { id: In(dto.customizationOptionIds) },
        relations: ['group', 'group.product']
      });
      
      for (const option of options) {
        if (option.group?.product?.id !== product.id) {
           throw new BadRequestException(`Customization option ID ${option.id} does not belong to the selected product`);
        }
        finalAmount += Number(option.additionalPrice);
      }
    }

    const customerProduct = this.customerProductRepo.create({
      customer,
      vendorSubscriptionPlan: plan,
      product,

      productName: dto.productName ?? null,
      quantity: dto.quantity ?? null,
      amount: finalAmount, // Use recalculated amount instead of trusting frontend
      notes: dto.notes ?? null,
      customizationOptionIds: dto.customizationOptionIds ?? null,
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
