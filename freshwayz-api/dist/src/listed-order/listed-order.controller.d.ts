import { ListedOrderService } from './listed-order.service';
import { CreateListedOrderDto } from './dto/create-listed-order.dto';
import { UpdateListedOrderDto } from './dto/update-listed-order.dto';
import { ListedOrder } from './entities/listed-order.entity';
export declare class ListedOrderController {
    private readonly listedOrdersService;
    constructor(listedOrdersService: ListedOrderService);
    findAll(): Promise<ListedOrder[]>;
    findOne(id: number): Promise<ListedOrder>;
    create(dto: CreateListedOrderDto): Promise<ListedOrder>;
    update(id: number, dto: UpdateListedOrderDto): Promise<ListedOrder>;
    remove(id: number): Promise<void>;
}
