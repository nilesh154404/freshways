import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateListedOrderDto {
  //   @ApiProperty({
  //     description: 'ID of the order this item belongs to',
  //     example: 1,
  //   })
  //   @IsInt()
  //   @IsPositive()
  //   orderId: number;


  // @ApiProperty({ description: 'Customer ID placing the order' })
  // @IsNotEmpty()
  // customerId: number;

  @ApiPropertyOptional({
    description: 'Optional product ID if linked to a product',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  productId?: number;

  @ApiPropertyOptional({
    description: 'Manual product name if product is not linked',
    example: 'Custom Item',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productName?: string;

  @ApiPropertyOptional({
    description: 'Quantity of this line item',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Amount or line total',
    example: 199.99,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Optional notes',
    example: 'Urgent delivery',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  notes?: string;
}
