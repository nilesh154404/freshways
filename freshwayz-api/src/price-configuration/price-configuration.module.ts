import { Module } from '@nestjs/common';
import { PriceConfigurationService } from './price-configuration.service';
import { PriceConfigurationController } from './price-configuration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { VendorSubscriptionPlan } from 'src/vendor-subscription-plan/entities/vendor-subscription-plan.entity';
import { PriceConfiguration } from './entities/price-configuration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PriceConfiguration
    ]),
  ],
  controllers: [PriceConfigurationController],
  providers: [PriceConfigurationService],
})
export class PriceConfigurationModule { }
