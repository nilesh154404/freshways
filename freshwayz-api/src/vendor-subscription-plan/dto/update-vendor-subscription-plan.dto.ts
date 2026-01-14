import { PartialType } from '@nestjs/swagger';
import { CreateVendorSubscriptionPlanDto } from './create-vendor-subscription-plan.dto';

export class UpdateVendorSubscriptionPlanDto extends PartialType(CreateVendorSubscriptionPlanDto) {}
