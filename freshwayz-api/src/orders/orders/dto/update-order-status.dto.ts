import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum OrderStatus {
    // DRAFTED = 'DRAFTED',
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export class UpdateOrderStatusDto {
    @ApiProperty()
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
