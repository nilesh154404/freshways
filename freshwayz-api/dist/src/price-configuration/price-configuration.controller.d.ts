import { PriceConfigurationService } from './price-configuration.service';
import { CreatePriceConfigurationDto } from './dto/create-price-configuration.dto';
import { UpdatePriceConfigurationDto } from './dto/update-price-configuration.dto';
export declare class PriceConfigurationController {
    private readonly priceConfigurationService;
    constructor(priceConfigurationService: PriceConfigurationService);
    create(dto: CreatePriceConfigurationDto): Promise<import("./entities/price-configuration.entity").PriceConfiguration>;
    findAll(): Promise<import("./entities/price-configuration.entity").PriceConfiguration[]>;
    findOne(label: string): Promise<import("./entities/price-configuration.entity").PriceConfiguration>;
    update(label: string, dto: UpdatePriceConfigurationDto): Promise<import("./entities/price-configuration.entity").PriceConfiguration>;
    remove(label: string): Promise<import("./entities/price-configuration.entity").PriceConfiguration>;
}
