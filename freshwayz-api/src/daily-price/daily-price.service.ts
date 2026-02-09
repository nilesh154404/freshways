import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyPrice } from './entities/daily-price.entity';
import { PriceLog } from './entities/price-log.entity';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { CreateDailyPriceDto } from './dto/create-daily-price.dto';
import { UpdateDailyPriceDto } from './dto/update-daily-price.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DailyPriceService {
  private readonly logger = new Logger(DailyPriceService.name);
  constructor(
    @InjectRepository(DailyPrice)
    private readonly dailyPriceRepo: Repository<DailyPrice>,

    @InjectRepository(PriceLog)
    private readonly priceLogRepo: Repository<PriceLog>,

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

    // STEP 1: Fetch current active price
    const currentActive = await this.dailyPriceRepo.findOne({
      where: {
        product: { id: dto.productId },
        vendor: { id: dto.vendorId },
        isActive: true,
      },
      relations: ['product', 'vendor'],
    });

    // STEP 2: Always insert into price_logs for audit trail
    // If there's a current active price and values changed, log the change
    if (currentActive && (currentActive.amount !== dto.amount || currentActive.mrp_amount !== dto.mrp_amount)) {
      const priceLog = new PriceLog();
      priceLog.product = product;
      priceLog.vendor = vendor;
      priceLog.old_amount = currentActive.amount;
      priceLog.new_amount = dto.amount;
      priceLog.old_mrp = currentActive.mrp_amount;
      priceLog.new_mrp = dto.mrp_amount;
      await this.priceLogRepo.save(priceLog);
      this.logger.log(`Price log created - OLD: ${currentActive.amount}/${currentActive.mrp_amount} → NEW: ${dto.amount}/${dto.mrp_amount}`);
    }

    const existingSameDate = await this.dailyPriceRepo.findOne({
      where: {
        product: { id: dto.productId },
        vendor: { id: dto.vendorId },
        date: dto.date as any,
      },
      relations: ['product', 'vendor'],
    });

    if (existingSameDate) {
      // STEP 3: Update daily_price with new values
      existingSameDate.amount = dto.amount;
      existingSameDate.mrp_amount = dto.mrp_amount;
      existingSameDate.date = dto.date as any;
      existingSameDate.isActive = dto.isActive ?? true;
      existingSameDate.product = product;
      existingSameDate.vendor = vendor;
      return this.dailyPriceRepo.save(existingSameDate);
    }

    const shouldBeActive = dto.isActive ?? true;
    if (shouldBeActive) {
      await this.dailyPriceRepo
        .createQueryBuilder()
        .update(DailyPrice)
        .set({ isActive: false })
        .where('productId = :productId', { productId: dto.productId })
        .andWhere('vendorId = :vendorId', { vendorId: dto.vendorId })
        .andWhere('isActive = :isActive', { isActive: true })
        .execute();
    }

    const dailyPrice = this.dailyPriceRepo.create({
      amount: dto.amount,
      mrp_amount: dto.mrp_amount,
      date: dto.date,
      isActive: shouldBeActive,
      product,
      vendor
    });

    return this.dailyPriceRepo.save(dailyPrice);
  }

  findAll(vendorId?: number, productId?: number) {
    const query = this.dailyPriceRepo
      .createQueryBuilder('daily_price')
      .leftJoinAndSelect('daily_price.product', 'product')
      .leftJoinAndSelect('daily_price.vendor', 'vendor')
      .orderBy('daily_price.date', 'DESC')
      .addOrderBy('daily_price.updatedAt', 'DESC')
      .addOrderBy('daily_price.id', 'DESC');

    if (vendorId) {
      query.andWhere('vendor.id = :vendorId', { vendorId });
    }

    if (productId) {
      query.andWhere('product.id = :productId', { productId });
    }

    return query.getMany();
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

  // Get price history for a specific product and vendor
  async getPriceHistory(productId: number, vendorId?: number) {
    const query = this.priceLogRepo
      .createQueryBuilder('price_log')
      .leftJoinAndSelect('price_log.product', 'product')
      .leftJoinAndSelect('price_log.vendor', 'vendor')
      .select([
        'price_log.id',
        'price_log.old_amount',
        'price_log.new_amount',
        'price_log.old_mrp',
        'price_log.new_mrp',
        'price_log.changedAt',
        'product.id',
        'product.label',
        'vendor.id',
        'vendor.businessName'
      ])
      .where('product.id = :productId', { productId })
      .orderBy('price_log.changedAt', 'DESC');

    if (vendorId) {
      query.andWhere('vendor.id = :vendorId', { vendorId });
    }

    return query.getMany();
  }

  // Cron job to monitor price changes every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async monitorPriceChanges() {
    try {
      this.logger.log('Starting price change monitoring...');

      // Get all active prices
      const activePrices = await this.dailyPriceRepo.find({
        where: { isActive: true },
        relations: ['product', 'vendor'],
      });

      for (const activePrice of activePrices) {
        // Get the latest price log for this product-vendor combination
        const latestLog = await this.priceLogRepo.findOne({
          where: {
            product: { id: activePrice.product.id },
            vendor: { id: activePrice.vendor.id },
          },
          order: { changedAt: 'DESC' },
        });

        // If no log exists or prices have changed, create a new log
        const shouldLog = !latestLog || 
          latestLog.new_amount !== activePrice.amount || 
          latestLog.new_mrp !== activePrice.mrp_amount;

        if (shouldLog) {
          const priceLog = new PriceLog();
          priceLog.product = activePrice.product;
          priceLog.vendor = activePrice.vendor;
          priceLog.old_amount = latestLog?.new_amount || null;
          priceLog.new_amount = activePrice.amount;
          priceLog.old_mrp = latestLog?.new_mrp || null;
          priceLog.new_mrp = activePrice.mrp_amount;
          await this.priceLogRepo.save(priceLog);
          this.logger.log(`Detected price change for product ${activePrice.product.id}, vendor ${activePrice.vendor.id}`);
        }
      }

      this.logger.log('Price change monitoring completed');
    } catch (error) {
      this.logger.error('Failed to monitor price changes', error as Error);
    }
  }

  @Cron('0 * * * *')
  async syncActivePrices() {
    try {
      const latestByGroup = await this.dailyPriceRepo
        .createQueryBuilder('dp')
        .select('dp.productId', 'productId')
        .addSelect('dp.vendorId', 'vendorId')
        .addSelect('MAX(dp.date)', 'maxDate')
        .groupBy('dp.productId')
        .addGroupBy('dp.vendorId')
        .getRawMany<{ productId: number; vendorId: number; maxDate: string }>();

      const latestIds: number[] = [];

      for (const row of latestByGroup) {
        const latest = await this.dailyPriceRepo
          .createQueryBuilder('dp')
          .select('dp.id', 'id')
          .where('dp.productId = :productId', { productId: row.productId })
          .andWhere('dp.vendorId = :vendorId', { vendorId: row.vendorId })
          .andWhere('dp.date = :maxDate', { maxDate: row.maxDate })
          .orderBy('dp.id', 'DESC')
          .getRawOne<{ id: number }>();

        if (latest?.id) latestIds.push(Number(latest.id));
      }

      if (latestIds.length === 0) return;

      await this.dailyPriceRepo
        .createQueryBuilder()
        .update(DailyPrice)
        .set({ isActive: false })
        .execute();

      await this.dailyPriceRepo
        .createQueryBuilder()
        .update(DailyPrice)
        .set({ isActive: true })
        .where('id IN (:...ids)', { ids: latestIds })
        .execute();
    } catch (error) {
      this.logger.error('Failed to sync active daily prices', error as Error);
    }
  }
}
