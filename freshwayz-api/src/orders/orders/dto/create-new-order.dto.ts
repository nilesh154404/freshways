import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, IsArray } from 'class-validator';
import { CreateListedOrderDto } from 'src/listed-order/dto/create-listed-order.dto';
import { ListedOrder } from 'src/listed-order/entities/listed-order.entity';

export class CreateNewOrderDto {
    @ApiProperty({ description: 'Customer ID placing the order' })
    @IsNotEmpty()
    customerId: number;

    @ApiPropertyOptional({ description: 'Vendor ID for the order, optional' })
    @IsOptional()
    vendorId?: number;

    @ApiProperty({ description: 'Community ID for the order' })
    @IsNotEmpty()
    communityId: number;

    @ApiPropertyOptional({ description: 'Delivery date of the order' })
    @IsOptional()
    @IsDateString()
    deliveryDate?: string;

    @IsOptional()
    deliverySlotId: number;

    @IsOptional()
    vendorSubscriptionPlanId: number;

    @ApiPropertyOptional({ description: 'Grand total of the order', default: 0 })
    @IsOptional()
    @IsNumber()
    grandTotal?: number;

    @ApiPropertyOptional({ description: 'Listed Orders', type: [Object] })
    @IsOptional()
    @IsArray()
    listedOrders?: CreateListedOrderDto[];
}
