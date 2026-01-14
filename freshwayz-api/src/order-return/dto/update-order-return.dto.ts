import { PartialType } from '@nestjs/swagger';
import { CreateOrderReturnDto } from './create-order-return.dto';

export class UpdateOrderReturnDto extends PartialType(CreateOrderReturnDto) {}
