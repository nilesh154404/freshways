import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateOrderReturnDto {
    @ApiProperty({ description: 'Customer ID filing the request' })
    @IsNotEmpty()
    @IsNumber()
    customerId: number;

    @ApiProperty({ description: 'Order ID related to the request' })
    @IsNotEmpty()
    @IsNumber()
    orderId: number;

    @ApiPropertyOptional({ description: 'Product ID being returned/cancelled' })
    @IsOptional()
    @IsNumber()
    productId?: number;

    @ApiPropertyOptional({ description: 'Product Name' })
    @IsOptional()
    @IsString()
    productName?: string;

    @ApiProperty({ description: 'Contact Name' })
    @IsNotEmpty()
    @IsString()
    contactName: string;

    @ApiProperty({ description: 'Reason for return/cancellation' })
    @IsNotEmpty()
    @IsString()
    reason: string;

    @ApiPropertyOptional({ description: 'Optional product/receipt image URL' })
    @IsOptional()
    @IsString()
    imageUrl?: string;
}
