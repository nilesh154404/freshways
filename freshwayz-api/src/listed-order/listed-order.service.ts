import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  async findAll(user?: any): Promise<ListedOrder[]> {
    if (user && user.role?.toLowerCase() === 'vendor') {
      return this.listedOrderRepository.find({
        where: { order: { vendor: { id: user.profileId } } },
        relations: ['order', 'product'],
      });
    }
    return this.listedOrderRepository.find({
      relations: ['order', 'product'],
    });
  }

  async findOne(id: number, user?: any): Promise<ListedOrder> {
    const item = await this.listedOrderRepository.findOne({
      where: { id },
      relations: ['order', 'order.vendor', 'product'],
    });

    if (!item) throw new NotFoundException(`ListedOrder #${id} not found`);

    if (user && user.role?.toLowerCase() === 'vendor') {
      if (item.order?.vendor && item.order.vendor.id !== user.profileId) {
        throw new ForbiddenException('You can only access listed orders for your own orders');
      }
    }

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

  async update(id: number, dto: UpdateListedOrderDto, user?: any): Promise<ListedOrder> {
    const item = await this.listedOrderRepository.findOne({
      where: { id },
      relations: ['order', 'order.vendor', 'product'],
    });
    if (!item) throw new NotFoundException(`ListedOrder #${id} not found`);

    if (user && user.role?.toLowerCase() === 'vendor') {
      if (item.order?.vendor && item.order.vendor.id !== user.profileId) {
        throw new ForbiddenException('You can only update listed orders for your own orders');
      }
    }

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

  async remove(id: number, user?: any): Promise<void> {
    const item = await this.listedOrderRepository.findOne({
      where: { id },
      relations: ['order', 'order.vendor'],
    });
    if (!item) throw new NotFoundException(`ListedOrder #${id} not found`);

    if (user && user.role?.toLowerCase() === 'vendor') {
      if (item.order?.vendor && item.order.vendor.id !== user.profileId) {
        throw new ForbiddenException('You can only delete listed orders for your own orders');
      }
    }

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
