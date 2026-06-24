import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateOrderReturnDto } from './dto/create-order-return.dto';
import { UpdateOrderReturnDto } from './dto/update-order-return.dto';
import { OrderReturn } from './entities/order-return.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class OrderReturnService {
  constructor(
    @InjectRepository(OrderReturn)
    private readonly orderReturnRepo: Repository<OrderReturn>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(createOrderReturnDto: CreateOrderReturnDto): Promise<OrderReturn> {
    const { customerId, orderId, productId, productName, contactName, reason, imageUrl } = createOrderReturnDto;

    const customer = await this.customerRepo.findOneBy({ id: customerId });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    let product: Product | null = null;
    if (productId) {
      product = await this.productRepo.findOneBy({ id: productId });
    }

    // Check if return request already exists for this order + product
    const existing = await this.orderReturnRepo.findOne({
      where: {
        order: { id: orderId },
        product: productId ? { id: productId } : IsNull(),
        productName: productId ? undefined : (productName || IsNull()),
      },
    });

    if (existing) {
      throw new BadRequestException('A return/cancellation request has already been submitted for this item.');
    }

    const orderReturn = this.orderReturnRepo.create({
      customer,
      order,
      product,
      productName: productName || (product ? product.label : null),
      contactName,
      reason,
      imageUrl,
      status: 'PENDING',
    });

    return this.orderReturnRepo.save(orderReturn);
  }

  async findAll(): Promise<OrderReturn[]> {
    return this.orderReturnRepo.find({
      relations: ['customer', 'order', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCustomerId(customerId: number): Promise<OrderReturn[]> {
    return this.orderReturnRepo.find({
      where: { customer: { id: customerId } },
      relations: ['customer', 'order', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByVendorId(vendorId: number): Promise<OrderReturn[]> {
    return this.orderReturnRepo.find({
      where: [
        { order: { vendor: { id: vendorId } } },
        { product: { vendor: { id: vendorId } } }
      ],
      relations: ['customer', 'order', 'product', 'order.vendor', 'product.vendor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<OrderReturn> {
    const request = await this.orderReturnRepo.findOne({
      where: { id },
      relations: ['customer', 'order', 'product'],
    });
    if (!request) {
      throw new NotFoundException(`Refund/Cancel request with ID ${id} not found`);
    }
    return request;
  }

  async update(id: number, updateOrderReturnDto: UpdateOrderReturnDto): Promise<OrderReturn> {
    const request = await this.findOne(id);
    Object.assign(request, updateOrderReturnDto);
    return this.orderReturnRepo.save(request);
  }

  async remove(id: number): Promise<void> {
    const request = await this.findOne(id);
    await this.orderReturnRepo.remove(request);
  }

  async confirmCancel(id: number): Promise<OrderReturn> {
    const request = await this.orderReturnRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!request) {
      throw new NotFoundException(`Refund/Cancel request with ID ${id} not found`);
    }

    request.status = 'CANCELLED';
    const savedRequest = await this.orderReturnRepo.save(request);

    if (request.order) {
      request.order.orderStatus = 'CANCELLED';
      await this.orderRepo.save(request.order);
    }

    return savedRequest;
  }
}
