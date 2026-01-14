import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'ID of the customer',
    example: 123,
  })
  @IsNumber()
  customerId: number;

  @ApiProperty({
    description: 'ID of the subscription plan',
    example: 1,
  })
  @IsNumber()
  planId: number;

  @ApiPropertyOptional({
    description: 'Indicates if the subscription is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
