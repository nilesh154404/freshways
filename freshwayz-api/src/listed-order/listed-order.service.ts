import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListedOrder } from './entities/listed-order.entity';
import { CreateListedOrderDto } from './dto/create-listed-order.dto';
import { UpdateListedOrderDto } from './dto/update-listed-order.dto';

@Injectable()
export class ListedOrderService {
  constructor(
    @InjectRepository(ListedOrder)
    private readonly listedOrderRepository: Repository<ListedOrder>,
  ) { }

  async findAll(): Promise<ListedOrder[]> {
    return this.listedOrderRepository.find({
      relations: ['order', 'product'],
    });
  }

  async findOne(id: number): Promise<ListedOrder> {
    const item = await this.listedOrderRepository.findOne({
      where: { id },
      relations: ['order', 'product'],
    });

    if (!item) throw new NotFoundException(`ListedOrder #${id} not found`);
    return item;
  }

  async create(dto: CreateListedOrderDto): Promise<ListedOrder> {
    const item = new ListedOrder();

    // item.order = { id: dto.orderId } as any;
    item.product = dto.productId ? ({ id: dto.productId } as any) : null;

    item.productName = dto.productName ?? null;
    item.quantity = dto.quantity ?? null;
    item.amount = dto.amount ?? null;
    item.notes = dto.notes ?? null;

    return this.listedOrderRepository.save(item);
  }

  async update(id: number, dto: UpdateListedOrderDto): Promise<ListedOrder> {
    const item = await this.listedOrderRepository.findOne({
      where: { id },
      relations: ['order', 'product'],
    });
    if (!item) throw new NotFoundException(`ListedOrder #${id} not found`);

    if (dto.orderId) item.order = { id: dto.orderId } as any;
    if ('productId' in dto)
      item.product = dto.productId ? ({ id: dto.productId } as any) : null;

    Object.assign(item, dto);
    const updatedItem = await this.listedOrderRepository.save(item);

    const parentOrder = item.order;
    if (parentOrder) {
      const allItems = await this.listedOrderRepository.find({
        where: { order: { id: parentOrder.id } },
      });
      const total = allItems.reduce((sum, current) => {
        const qty = Number(current.quantity || 0);
        const amt = Number(current.amount || 0);
        return sum + qty * amt;
      }, 0);
      parentOrder.grandTotal = total;
      await this.listedOrderRepository.manager.save(parentOrder);
    }

    return updatedItem;
  }

  async remove(id: number): Promise<void> {
    const item = await this.listedOrderRepository.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!item) throw new NotFoundException(`ListedOrder #${id} not found`);

    const parentOrder = item.order;
    await this.listedOrderRepository.remove(item);

    if (parentOrder) {
      const allItems = await this.listedOrderRepository.find({
        where: { order: { id: parentOrder.id } },
      });
      const total = allItems.reduce((sum, current) => {
        const qty = Number(current.quantity || 0);
        const amt = Number(current.amount || 0);
        return sum + qty * amt;
      }, 0);
      parentOrder.grandTotal = total;
      await this.listedOrderRepository.manager.save(parentOrder);
    }
  }
}
