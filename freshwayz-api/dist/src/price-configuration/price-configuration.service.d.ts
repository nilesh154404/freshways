import { Repository } from 'typeorm';
import { PriceConfiguration } from './entities/price-configuration.entity';
import { CreatePriceConfigurationDto } from './dto/create-price-configuration.dto';
import { UpdatePriceConfigurationDto } from './dto/update-price-configuration.dto';
export declare class PriceConfigurationService {
    private readonly priceConfigRepo;
    constructor(priceConfigRepo: Repository<PriceConfiguration>);
    create(dto: CreatePriceConfigurationDto): Promise<PriceConfiguration>;
    findAll(): Promise<PriceConfiguration[]>;
    findOne(label: string): Promise<PriceConfiguration>;
    update(label: string, dto: UpdatePriceConfigurationDto): Promise<PriceConfiguration>;
    remove(label: string): Promise<PriceConfiguration>;
}
