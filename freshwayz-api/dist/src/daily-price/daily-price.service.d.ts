import { Repository } from 'typeorm';
import { DailyPrice } from './entities/daily-price.entity';
import { PriceLog } from './entities/price-log.entity';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { CreateDailyPriceDto } from './dto/create-daily-price.dto';
import { UpdateDailyPriceDto } from './dto/update-daily-price.dto';
export declare class DailyPriceService {
    private readonly dailyPriceRepo;
    private readonly priceLogRepo;
    private readonly productRepo;
    private readonly vendorRepo;
    private readonly logger;
    constructor(dailyPriceRepo: Repository<DailyPrice>, priceLogRepo: Repository<PriceLog>, productRepo: Repository<Product>, vendorRepo: Repository<Vendor>);
    create(dto: CreateDailyPriceDto): Promise<DailyPrice>;
    findAll(vendorId?: number, productId?: number): Promise<DailyPrice[]>;
    findOne(id: number): Promise<DailyPrice>;
    update(id: number, dto: UpdateDailyPriceDto): Promise<DailyPrice>;
    remove(id: number): Promise<DailyPrice>;
    getPriceHistory(productId: number, vendorId?: number): Promise<PriceLog[]>;
    monitorPriceChanges(): Promise<void>;
    syncActivePrices(): Promise<void>;
}
