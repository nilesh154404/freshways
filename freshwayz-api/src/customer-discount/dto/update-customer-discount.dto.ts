import { PartialType } from '@nestjs/swagger';
import { CreateCustomerDiscountDto } from './create-customer-discount.dto';

export class UpdateCustomerDiscountDto extends PartialType(CreateCustomerDiscountDto) {}
