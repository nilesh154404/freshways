import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOffering } from './entities/service-offering.entity';
import { CreateServiceOfferingDto } from './dto/create-service-offering.dto';
import { UpdateServiceOfferingDto } from './dto/update-service-offering.dto';

@Injectable()
export class ServiceOfferingService {
  constructor(
    @InjectRepository(ServiceOffering)
    private readonly serviceOfferingRepo: Repository<ServiceOffering>,
  ) {}

  create(dto: CreateServiceOfferingDto) {
    const serviceOffering = this.serviceOfferingRepo.create(dto);
    return this.serviceOfferingRepo.save(serviceOffering);
  }

  findAll() {
    return this.serviceOfferingRepo.find({
      relations: ['products'],
    });
  }

  async findOne(serviceCode: string) {
    const item = await this.serviceOfferingRepo.findOne({
      where: { serviceCode },
      relations: ['products'],
    });

    if (!item) {
      throw new NotFoundException('Service offering not found');
    }

    return item;
  }

  async update(serviceCode: string, dto: UpdateServiceOfferingDto) {
    const item = await this.findOne(serviceCode);

    Object.assign(item, dto);

    return this.serviceOfferingRepo.save(item);
  }

  async remove(serviceCode: string) {
    const item = await this.findOne(serviceCode);
    return this.serviceOfferingRepo.remove(item);
  }
}
