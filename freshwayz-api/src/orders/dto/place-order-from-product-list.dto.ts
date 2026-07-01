import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class PlaceOrderFromProductListDto {
  @ApiProperty({ description: 'Customer ID placing the order', example: 1 })
  @IsNotEmpty()
  @IsInt()
  customerId: number;

  @ApiProperty({ description: 'Community ID for the order', example: 1, required: false })
  @IsOptional()
  @IsInt()
  communityId?: number;

  @ApiProperty({ description: 'Vendor Subscription Plan ID', example: 2 })
  @IsNotEmpty()
  @IsInt()
  vendorSubscriptionPlanId: number;
}

