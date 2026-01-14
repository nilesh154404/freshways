import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  IsPositive,
  IsOptional,
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

  @ApiProperty({
    description: 'Vendor ID to which this plan belongs',
    example: 5,
  })
  @IsInt()
  @IsPositive()
  vendorId: number;
}
