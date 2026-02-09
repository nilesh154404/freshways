import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  IsPositive,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateVendorSubscriptionPlanDto {
  @ApiProperty({
    description: 'Label of the vendor subscription plan',
    example: 'Basic Plan',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  label: string;

  @ApiProperty({
    description: 'Description of the plan',
    example: 'Includes basic product listing and support',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  description: string;

  @ApiPropertyOptional({
    description: 'Price of the plan',
    example: 999,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Duration of the plan (e.g., 1 month, 3 months, 1 year)',
    example: '1 month',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  duration?: string;

  @ApiProperty({
    description: 'Vendor ID to which this plan belongs',
    example: 5,
  })
  @IsInt()
  @IsPositive()
  vendorId: number;
}
