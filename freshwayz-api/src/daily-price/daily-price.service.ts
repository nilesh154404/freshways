import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyPrice } from './entities/daily-price.entity';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { CreateDailyPriceDto } from './dto/create-daily-price.dto';
import { UpdateDailyPriceDto } from './dto/update-daily-price.dto';

@Injectable()
export class DailyPriceService {
  constructor(
    @InjectRepository(DailyPrice)
    private readonly dailyPriceRepo: Repository<DailyPrice>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) { }

  async create(dto: CreateDailyPriceDto): Promise<DailyPrice> {
    const product = await this.productRepo.findOneBy({ id: dto.productId });
    if (!product) throw new NotFoundException('Product not found');

    const vendor = await this.vendorRepo.findOneBy({ id: dto.vendorId });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const dailyPrice = this.dailyPriceRepo.create({
      amount: dto.amount,
      mrp_amount: dto.mrp_amount,
      date: dto.date,
      isActive: dto.isActive ?? false,
      product,
      vendor
    });

    return this.dailyPriceRepo.save(dailyPrice);
  }

  findAll() {
    return this.dailyPriceRepo.find({
      relations: ['product', 'vendor']
    });
  }

  async findOne(id: number) {
    const price = await this.dailyPriceRepo.findOne({
      where: { id },
      relations: ['product', 'vendor']
    });

    if (!price) throw new NotFoundException('Daily price not found');

    return price;
  }

  async update(id: number, dto: UpdateDailyPriceDto) {
    const price = await this.dailyPriceRepo.findOne({
      where: {
        id
      }
    });
    if (!price) throw new NotFoundException('Product not found');

    const product = await this.productRepo.findOneBy({ id: dto.productId });
    if (!product) throw new NotFoundException('Product not found');

    const vendor = await this.vendorRepo.findOneBy({ id: dto.vendorId });
    if (!vendor) throw new NotFoundException('Vendor not found');
    price.vendor = vendor;

    Object.assign(price, dto);
    return this.dailyPriceRepo.save(price);
  }

  async remove(id: number) {
    const price = await this.findOne(id);
    return this.dailyPriceRepo.remove(price);
  }
}
