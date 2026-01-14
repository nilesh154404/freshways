import { PartialType } from '@nestjs/mapped-types';
import { CreatePriceConfigurationDto } from './create-price-configuration.dto';

export class UpdatePriceConfigurationDto extends PartialType(CreatePriceConfigurationDto) {}
