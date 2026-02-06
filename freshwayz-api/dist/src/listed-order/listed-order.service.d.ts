import { Repository } from 'typeorm';
import { ListedOrder } from './entities/listed-order.entity';
import { CreateListedOrderDto } from './dto/create-listed-order.dto';
import { UpdateListedOrderDto } from './dto/update-listed-order.dto';
export declare class ListedOrderService {
    private readonly listedOrderRepository;
    constructor(listedOrderRepository: Repository<ListedOrder>);
    findAll(): Promise<ListedOrder[]>;
    findOne(id: number): Promise<ListedOrder>;
    create(dto: CreateListedOrderDto): Promise<ListedOrder>;
    update(id: number, dto: UpdateListedOrderDto): Promise<ListedOrder>;
    remove(id: number): Promise<void>;
}
