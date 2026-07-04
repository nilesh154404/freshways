import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, IsString } from 'class-validator';
import { ListedOrder } from 'src/listed-order/entities/listed-order.entity';

export class CreateOrderDto {
    @ApiProperty({ description: 'Customer ID placing the order' })
    @IsNotEmpty()
    customerId: number;

    //   @ApiPropertyOptional({ description: 'Vendor ID for the order, optional' })
    @IsOptional()
    vendorId?: number;

    //   @ApiProperty({ description: 'Community ID for the order' })
    @IsNotEmpty()
    communityId: number;

    @IsOptional()
    deliverySlotId:number;

    // @ApiPropertyOptional({ description: 'Delivery date of the order' })
    @IsOptional()
    @IsDateString()
    deliveryDate?: string;

    // @ApiPropertyOptional({ description: 'Grand total of the order', default: 0 })
    @IsOptional()
    @IsNumber()
    grandTotal?: number;

    @ApiPropertyOptional({ description: 'Flat No' })
    @IsOptional()
    @IsString()
    flatNo?: string;

    @ApiPropertyOptional({ description: 'Floor No' })
    @IsOptional()
    @IsString()
    floorNo?: string;

    @ApiPropertyOptional({ description: 'Delivery Address' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ description: 'Mobile/Phone No' })
    @IsOptional()
    @IsString()
    phone?: string;

    // @ApiPropertyOptional({ description: 'Listed Orders', type: [Object] })
    @IsOptional()
    @IsArray()
    listedOrders?: ListedOrder[];
}
