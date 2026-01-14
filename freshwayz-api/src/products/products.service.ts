import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { VendorSubscriptionPlan } from 'src/vendor-subscription-plan/entities/vendor-subscription-plan.entity';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';
import { paginate } from 'src/helpers/pagination/pagination';
import { Categories } from 'src/categories/categories.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ServiceOffering)
    private readonly serviceOfferingRepo: Repository<ServiceOffering>,

    @InjectRepository(VendorSubscriptionPlan)
    private readonly vendorPlanRepo: Repository<VendorSubscriptionPlan>,

    @InjectRepository(Categories)
    private readonly categoryRepo: Repository<Categories>,

    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) { }

  // ----------------------------
  // CREATE PRODUCT (SAFE VERSION)
  // ----------------------------
  async create(createProductDto: CreateProductDto) {
    try {
      const {
        label,
        description,
        productUrl,
        measurementUnit,
        measurementValue,
        // serviceOfferingCode,
        vendorSubscriptionPlanId,
        categoryId,
        vendorId
      } = createProductDto;

      // Validate service offering
      // const serviceOffering = await this.serviceOfferingRepo.findOne({
      //   where: { serviceCode: serviceOfferingCode },
      // });

      // if (!serviceOffering) {
      //   throw new NotFoundException(
      //     `Service Offering with ID ${serviceOfferingCode} not found`,
      //   );
      // }

      // Validate vendor subscription plan (mandatory)
      const vendorSubscriptionPlan = await this.vendorPlanRepo.findOne({
        where: { id: vendorSubscriptionPlanId },
      });

      if (!vendorSubscriptionPlan) {
        throw new NotFoundException(
          `Vendor Subscription Plan with ID ${vendorSubscriptionPlanId} not found`,
        );
      }

      // Validate vendor subscription plan (mandatory)
      const category = await this.categoryRepo.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Vendor Subscription Plan with ID ${categoryId} not found`,
        );
      }

      // Validate vendor subscription plan (mandatory)
      const vendor = await this.vendorRepo.findOne({
        where: { id: vendorId },
      });

      if (!vendor) {
        throw new NotFoundException(
          `Vendor Subscription Plan with ID ${vendor} not found`,
        );
      }


      // Create product
      const product = this.productRepo.create({
        label,
        description,
        productUrl,
        measurementUnit,
        measurementValue,
        category,
        vendor,
        // serviceOffering,
        vendorSubscriptionPlan,
      });

      return await this.productRepo.save(product);
    } catch (error) {
      console.error('Error creating product:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to create product');
    }
  }

  // findAll() {
  //   return this.productRepo.find({
  //     relations: ['serviceOffering', 'vendorSubscriptionPlan'],
  //   });
  // }
  // async findAll(dto: RangeDTO) {
  //   const qb = this.productRepo
  //     .createQueryBuilder('product')
  //     .leftJoinAndSelect('product.serviceOffering', 'serviceOffering')
  //     .leftJoinAndSelect('product.vendorSubscriptionPlan', 'vendorSubscriptionPlan')
  //     .leftJoinAndSelect('product.vendor', 'vendor')
  //     .leftJoinAndSelect('product.dailyPrices', 'dailyPrices')
  //     // .where('product.isDeleted = false')
  //     .orderBy('product.id', 'DESC');

  //   return paginate(qb, {
  //     page: dto.page,
  //     limit: dto.limit,
  //   });
  // }
  async findAll(dto: RangeDTO, categoryId?: number, vendorId?: number) {
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.serviceOffering', 'serviceOffering')
      .leftJoinAndSelect('product.vendorSubscriptionPlan', 'vendorSubscriptionPlan')
      .leftJoinAndSelect('product.vendor', 'vendor')
      .leftJoinAndSelect('product.dailyPrices', 'dailyPrices')
      .leftJoinAndSelect('product.discounts', 'discounts')
      // .where('product.isDeleted = false')
      .orderBy('product.id', 'DESC');

    if (categoryId) {
      qb.andWhere('product.category = :categoryId', { categoryId });
    }

    if (vendorId) {
      qb.andWhere('product.vendor = :vendorId', { vendorId });
    }

    return paginate(qb, {
      page: dto.page,
      limit: dto.limit,
    });
  }

  findOne(id: number) {
    return this.productRepo.findOne({
      where: { id },
      relations: ['serviceOffering', 'vendorSubscriptionPlan'],
    });
  }

  update(id: number, dto: any) {
    return `This action updates product #${id}`;
  }

  remove(id: number) {
    return this.productRepo.delete(id);
  }
}
