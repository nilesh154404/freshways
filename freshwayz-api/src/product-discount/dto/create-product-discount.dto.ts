import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';
import { DiscountType } from '../entities/discount-type.enum';

export class CreateProductDiscountDto {

  @ApiProperty({ enum: DiscountType, description: 'Type of discount' })
  @IsEnum(DiscountType)
  type: DiscountType;

  @ApiPropertyOptional({ description: 'Discount value for PERCENTAGE or FLAT' })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ description: 'Buy quantity for BOGO offers' })
  @IsOptional()
  @IsNumber()
  buyQuantity?: number;

  @ApiPropertyOptional({ description: 'Get quantity for BOGO offers' })
  @IsOptional()
  @IsNumber()
  getQuantity?: number;

  @ApiProperty({ description: 'Minimum quantity in cart to activate discount' })
  @IsNumber()
  @Min(1)
  minCartQuantity: number;

  @ApiProperty({ description: 'Discount start date', type: String, format: 'date-time' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'Discount end date', type: String, format: 'date-time' })
  @IsDateString()
  endDate: Date;

  @ApiPropertyOptional({ description: 'Is discount active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'ID of the product this discount applies to' })
  @IsNumber()
  productId: number;
}
