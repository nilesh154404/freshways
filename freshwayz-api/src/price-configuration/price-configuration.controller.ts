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
import { PriceConfigurationService } from './price-configuration.service';
import { CreatePriceConfigurationDto } from './dto/create-price-configuration.dto';
import { UpdatePriceConfigurationDto } from './dto/update-price-configuration.dto';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@Controller('price-configurations')
export class PriceConfigurationController {
  constructor(
    private readonly priceConfigurationService: PriceConfigurationService,
  ) {}

  @Post()
  create(@Body() dto: CreatePriceConfigurationDto) {
    return this.priceConfigurationService.create(dto);
  }

  @Get()
  findAll(@Query() dto: RangeDTO) {
    return this.priceConfigurationService.findAll(dto);
  }

  @Get(':label')
  findOne(@Param('label') label: string) {
    return this.priceConfigurationService.findOne(label);
  }

  @Patch(':label')
  update(
    @Param('label') label: string,
    @Body() dto: UpdatePriceConfigurationDto,
  ) {
    return this.priceConfigurationService.update(label, dto);
  }

  @Delete(':label')
  remove(@Param('label') label: string) {
    return this.priceConfigurationService.remove(label);
  }
}
