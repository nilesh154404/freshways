import { DailyPriceService } from './daily-price.service';
import { CreateDailyPriceDto } from './dto/create-daily-price.dto';
import { UpdateDailyPriceDto } from './dto/update-daily-price.dto';
export declare class DailyPriceController {
    private readonly dailyPriceService;
    constructor(dailyPriceService: DailyPriceService);
    create(dto: CreateDailyPriceDto): Promise<import("./entities/daily-price.entity").DailyPrice>;
    findAll(vendorId?: string, productId?: string): Promise<import("./entities/daily-price.entity").DailyPrice[]>;
    findOne(id: string): Promise<import("./entities/daily-price.entity").DailyPrice>;
    update(id: string, dto: UpdateDailyPriceDto): Promise<import("./entities/daily-price.entity").DailyPrice>;
    remove(id: string): Promise<import("./entities/daily-price.entity").DailyPrice>;
    getPriceHistory(productId: string, vendorId?: string): Promise<import("./entities/price-log.entity").PriceLog[]>;
}
