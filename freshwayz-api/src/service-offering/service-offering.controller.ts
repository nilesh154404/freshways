import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServiceOfferingService } from './service-offering.service';
import { CreateServiceOfferingDto } from './dto/create-service-offering.dto';
import { UpdateServiceOfferingDto } from './dto/update-service-offering.dto';

@Controller('service-offerings')
export class ServiceOfferingController {
  constructor(private readonly serviceOfferingService: ServiceOfferingService) {}

  @Post()
  create(@Body() dto: CreateServiceOfferingDto) {
    return this.serviceOfferingService.create(dto);
  }

  @Get()
  findAll() {
    return this.serviceOfferingService.findAll();
  }

  @Get(':serviceCode')
  findOne(@Param('serviceCode') serviceCode: string) {
    return this.serviceOfferingService.findOne(serviceCode);
  }

  @Patch(':serviceCode')
  update(
    @Param('serviceCode') serviceCode: string,
    @Body() dto: UpdateServiceOfferingDto,
  ) {
    return this.serviceOfferingService.update(serviceCode, dto);
  }

  @Delete(':serviceCode')
  remove(@Param('serviceCode') serviceCode: string) {
    return this.serviceOfferingService.remove(serviceCode);
  }
}
