import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateListedOrderDto } from './create-listed-order.dto';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateListedOrderDto extends PartialType(CreateListedOrderDto) {
      @ApiProperty({
        description: 'ID of the order this item belongs to',
        example: 1,
      })
      @IsOptional()
      @IsInt()
      @IsPositive()
      orderId?: number;
}
