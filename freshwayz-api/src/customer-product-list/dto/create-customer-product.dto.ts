/* export class CreateCustomerProductDto {
  customerId: number;
  vendorSubscriptionPlanId: number;

  productId?: number;

  productName?: string;
  quantity?: number;
  amount?: number;
  notes?: string;
}
 */
/* export class CreateCustomerProductDto {
  customerId: number;
  vendorSubscriptionPlanId: number;

  // optional reference only (NOT copying data)
  productId?: number;

  // hand-written fields (must be provided by user)
  productName?: string;
  quantity?: number;
  amount?: number;

  notes?: string;
}
 */
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCustomerProductDto {
  @IsNumber()
  customerId: number;

  @IsOptional()
  @IsNumber()
  vendorSubscriptionPlanId?: number;

  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
