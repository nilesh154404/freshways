import { Module } from '@nestjs/common';
import { ServiceOfferingService } from './service-offering.service';
import { ServiceOfferingController } from './service-offering.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOffering } from './entities/service-offering.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOffering])],
  controllers: [ServiceOfferingController],
  providers: [ServiceOfferingService],
})
export class ServiceOfferingModule { }
