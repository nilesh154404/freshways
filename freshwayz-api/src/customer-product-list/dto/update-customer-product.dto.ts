import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerProductDto {
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
