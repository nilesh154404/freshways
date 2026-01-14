import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceConfiguration } from './entities/price-configuration.entity';
import { CreatePriceConfigurationDto } from './dto/create-price-configuration.dto';
import { UpdatePriceConfigurationDto } from './dto/update-price-configuration.dto';

@Injectable()
export class PriceConfigurationService {
  constructor(
    @InjectRepository(PriceConfiguration)
    private readonly priceConfigRepo: Repository<PriceConfiguration>,
  ) {}

  create(dto: CreatePriceConfigurationDto) {
    const config = this.priceConfigRepo.create(dto);
    return this.priceConfigRepo.save(config);
  }

  findAll() {
    return this.priceConfigRepo.find();
  }

  async findOne(label: string) {
    const config = await this.priceConfigRepo.findOne({ where: { label } });
    if (!config) throw new NotFoundException('Price configuration not found');
    return config;
  }

  async update(label: string, dto: UpdatePriceConfigurationDto) {
    const config = await this.findOne(label);
    Object.assign(config, dto);
    return this.priceConfigRepo.save(config);
  }

  async remove(label: string) {
    const config = await this.findOne(label);
    return this.priceConfigRepo.remove(config);
  }
}
