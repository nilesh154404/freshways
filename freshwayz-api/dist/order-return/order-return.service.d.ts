import { CreateOrderReturnDto } from './dto/create-order-return.dto';
import { UpdateOrderReturnDto } from './dto/update-order-return.dto';
export declare class OrderReturnService {
    create(createOrderReturnDto: CreateOrderReturnDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateOrderReturnDto: UpdateOrderReturnDto): string;
    remove(id: number): string;
}
