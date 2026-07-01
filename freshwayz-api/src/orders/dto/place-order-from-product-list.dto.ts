import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt } from 'class-validator';

export class PlaceOrderFromProductListDto {
  @ApiProperty({ description: 'Customer ID placing the order', example: 1 })
  @IsNotEmpty()
  @IsInt()
  customerId: number;

  @ApiProperty({ description: 'Community ID for the order', example: 1 })
  @IsNotEmpty()
  @IsInt()
  communityId: number;

  @ApiProperty({ description: 'Vendor Subscription Plan ID', example: 2 })
  @IsNotEmpty()
  @IsInt()
  vendorSubscriptionPlanId: number;
}
