import { PartialType } from '@nestjs/swagger';
import { CreateCustomerRequestedProductDto } from './create-customer-requested-product.dto';

export class UpdateCustomerRequestedProductDto extends PartialType(CreateCustomerRequestedProductDto) {}
