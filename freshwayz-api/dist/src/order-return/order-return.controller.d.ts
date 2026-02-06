import { OrderReturnService } from './order-return.service';
import { CreateOrderReturnDto } from './dto/create-order-return.dto';
import { UpdateOrderReturnDto } from './dto/update-order-return.dto';
export declare class OrderReturnController {
    private readonly orderReturnService;
    constructor(orderReturnService: OrderReturnService);
    create(createOrderReturnDto: CreateOrderReturnDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateOrderReturnDto: UpdateOrderReturnDto): string;
    remove(id: string): string;
}
