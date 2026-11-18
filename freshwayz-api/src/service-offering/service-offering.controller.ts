import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ServiceOfferingService } from './service-offering.service';
import { CreateServiceOfferingDto } from './dto/create-service-offering.dto';
import { UpdateServiceOfferingDto } from './dto/update-service-offering.dto';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@ApiTags('Service Offerings')
@Controller('service-offerings')
export class ServiceOfferingController {
  constructor(private readonly serviceOfferingService: ServiceOfferingService) {}

  @Post()
  create(@Body() dto: CreateServiceOfferingDto) {
    return this.serviceOfferingService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service offerings with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() dto: RangeDTO) {
    return this.serviceOfferingService.findAll(dto);
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
