import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Community } from 'src/community/entities/community.entity';
import { ListedOrder } from 'src/listed-order/entities/listed-order.entity';
import { CreateNewOrderDto } from './dto/create-new-order.dto';
import { Product } from 'src/products/entities/product.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { DeliverySlot } from 'src/delivery-slot/entities/delivery-slot.entity';
import { VendorSubscriptionPlan } from 'src/vendor-subscription-plan/entities/vendor-subscription-plan.entity';
import { ProductDiscountService } from 'src/product-discount/product-discount.service';
import { DailyPrice } from 'src/daily-price/entities/daily-price.entity';
import { CustomerProduct } from 'src/customer-product-list/entities/customer-product.entity';

interface OrderFilter {
  customerId?: number;
  vendorId?: number;
  communityId?: number;
  orderStatus?: string;
  paymentStatus?: string;
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
  deliveryDate?: string; // ISO date string
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Community) private readonly communityRepo: Repository<Community>,
    @InjectRepository(ListedOrder) private readonly listedOrderRepo: Repository<ListedOrder>,
    @InjectRepository(DeliverySlot) private readonly deliverySlotRepo: Repository<DeliverySlot>,
    @InjectRepository(VendorSubscriptionPlan) private readonly vendorSubscriptionPlanRepo: Repository<VendorSubscriptionPlan>,
    @InjectRepository(DailyPrice) private readonly dailyPriceRepo: Repository<DailyPrice>,
    @InjectRepository(CustomerProduct) private readonly customerProductRepo: Repository<CustomerProduct>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    private readonly discountService: ProductDiscountService,

  ) { }

  // ----------------------------------------------------------
  // CREATE NEW ORDER
  // ----------------------------------------------------------
  async createNew(createDto: CreateNewOrderDto): Promise<Order> {
    const { customerId, vendorId, vendorSubscriptionPlanId, communityId, listedOrders, deliveryDate, deliverySlotId } = createDto;

    console.log(createDto);

    // Validate Relations
    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const vendor = vendorId
      ? await this.vendorRepo.findOne({ where: { id: vendorId } })
      : null;

    if (vendorId && !vendor) throw new NotFoundException('Vendor not found');

    const community = await this.communityRepo.findOne({
      where: { id: communityId },
    });
    if (!community) throw new NotFoundException('Community not found');

    if (!community) throw new NotFoundException('Community not found');

    let deliverySlot: DeliverySlot | null = null;
    if (deliverySlotId) {
      deliverySlot = await this.deliverySlotRepo.findOneBy({ id: deliverySlotId });
    }
    let vendorSubscriptionPlan: VendorSubscriptionPlan | undefined;

    if (vendorSubscriptionPlanId) {
      vendorSubscriptionPlan =
        await this.vendorSubscriptionPlanRepo.findOneBy({
          id: vendorSubscriptionPlanId,
        }) ?? undefined;
    }
    // const deliverySlot = await this.deliverySlotRepo.findOneBy({ id: deliverySlotId });

    // Create Order
    const order = this.orderRepo.create({
      customer,
      vendor,
      community,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      grandTotal: createDto.grandTotal || 0,
      deliverySlot,
      listedOrders: [],
      vendorSubscriptionPlan
    });

    // ---------------------------
    // Handle Listed Orders
    // ---------------------------
    let total = 0;
    const now = new Date();

    if (listedOrders && listedOrders.length > 0) {
      for (const item of listedOrders) {
        const listedOrder = new ListedOrder();
        listedOrder.order = order;
        listedOrder.notes = item.notes || null;
        listedOrder.productName = item.productName ?? null;
        listedOrder.quantity = item.quantity ?? null;

        if (!item.productId) {
          throw new BadRequestException('Product ID is required in listedOrders');
        }

        // Fetch product + discounts
        const product = await this.productRepo.findOne({
          where: { id: item.productId },
          relations: ['discounts'],
        });
        if (!product) throw new NotFoundException(`Product ID ${item.productId} not found`);
        listedOrder.product = product;

        // Fetch active daily price
        const dailyPrice = await this.dailyPriceRepo.findOne({
          where: { product: { id: item.productId }, isActive: true },
        });
        if (!dailyPrice) throw new NotFoundException(`Active price for product ${item.productId} not found`);

        const basePrice = Number(dailyPrice.amount);
        listedOrder.amount = basePrice;

        // Find applicable discount
        const activeDiscount = product.discounts.find(d =>
          d.isActive &&
          d.startDate <= now &&
          d.endDate >= now &&
          (item.quantity ?? 0) >= (d.minCartQuantity ?? 0)
        );

        if (activeDiscount && item.quantity) {
          const discountResult = this.discountService.calculatePrice(
            basePrice,
            item.quantity,
            activeDiscount
          );

          listedOrder.discountedAmount = discountResult.finalTotal ?? null;
          listedOrder.productDiscount = activeDiscount;
        } else {
          listedOrder.discountedAmount = basePrice * (item.quantity ?? 1);
          listedOrder.productDiscount = null;
        }

        // Accumulate total using discounted amount
        total += listedOrder.discountedAmount ?? 0;

        order.listedOrders.push(listedOrder);
      }
    }

    // Set grand total
    order.grandTotal = createDto.grandTotal ?? total;

    return this.orderRepo.save(order);
  }

  async updateStatus(orderId: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.orderStatus = dto.status;
    return this.orderRepo.save(order);
  }

  // order.service.ts
  // ----------------------------------------------------------
  // PLACE ORDER FROM CUSTOMER PRODUCT LIST
  // ----------------------------------------------------------
  async placeOrderFromProductList(dto: { customerId: number; communityId: number; vendorSubscriptionPlanId: number }): Promise<Order> {
    const { customerId, communityId, vendorSubscriptionPlanId } = dto;

    // Fetch customer
    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    // Fetch community
    const community = await this.communityRepo.findOne({ where: { id: communityId } });
    if (!community) throw new NotFoundException('Community not found');

    // Fetch vendor subscription plan with vendor info
    const plan = await this.vendorSubscriptionPlanRepo.findOne({
      where: { id: vendorSubscriptionPlanId },
      relations: ['vendor'],
    });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    const vendor = plan.vendor;

    // Fetch all product list items for this customer and plan
    const productListItems = await this.customerProductRepo.find({
      where: {
        customer: { id: customerId },
        vendorSubscriptionPlan: { id: vendorSubscriptionPlanId },
      },
      relations: ['product'],
    });

    if (!productListItems || productListItems.length === 0) {
      throw new BadRequestException('No products in the list for this subscription plan');
    }

    // Create the order
    const order = this.orderRepo.create({
      customer,
      vendor,
      community,
      vendorSubscriptionPlan: plan,
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING',
      grandTotal: 0,
    });

    const savedOrder = await this.orderRepo.save(order);

    // Create listed orders from customer product list
    let totalAmount = 0;
    const listedOrders: ListedOrder[] = [];

    for (const item of productListItems) {
      const unitPrice = item.amount ? Number(item.amount) : 0;
      const quantity = item.quantity ? Number(item.quantity) : 1;
      const lineTotal = unitPrice * quantity;

      const listedOrder = this.listedOrderRepo.create({
        order: savedOrder,
        product: item.product || null,
        productName: item.productName || item.product?.label || null,
        quantity: quantity,
        amount: unitPrice,
        discountedAmount: lineTotal,
        notes: item.notes || null,
      });
      await this.listedOrderRepo.save(listedOrder);
      listedOrders.push(listedOrder);
      
      totalAmount += lineTotal;
    }

    // Update order with total amount
    savedOrder.grandTotal = totalAmount;
    const finalOrder = await this.orderRepo.save(savedOrder);

    console.log(`Order #${finalOrder.id} placed successfully from product list`);

    return finalOrder;
  }

  async findByCustomerId(customerId: number): Promise<Order[]> {
    const orders = await this.orderRepo.find({
      where: { customer: { id: customerId } },
      relations: ['customer', 'vendor', 'listedOrders.product', 'deliverySlot', 'community', 'listedOrders', 'payments'],
      order: { createdAt: 'DESC' },
    });

    if (!orders || orders.length === 0) {
      throw new NotFoundException(`No orders found for customer ID ${customerId}`);
    }

    // Optional: remove circular references manually if needed
    // orders.forEach(order => {
    //   order.listedOrders.forEach(item => delete item.order);
    // });

    return orders;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { customerId, vendorId, communityId, listedOrders, deliveryDate, grandTotal, deliverySlotId } = createOrderDto;

    const customer = await this.customerRepo.findOneBy({ id: customerId });
    if (!customer) throw new NotFoundException('Customer not found');

    let vendor: Vendor | null = null; // explicitly allow null

    if (vendorId) {
      vendor = await this.vendorRepo.findOneBy({ id: vendorId });
      if (!vendor) throw new NotFoundException('Vendor not found');
    }

    let deliverySlot: DeliverySlot | null = null;

    if (deliverySlotId) {
      deliverySlot = await this.deliverySlotRepo.findOneBy({ id: deliverySlotId });
      if (!vendor) throw new NotFoundException('Vendor not found');
    }
    const community = await this.communityRepo.findOneBy({ id: communityId });
    if (!community) throw new NotFoundException('Community not found');

    const order = this.orderRepo.create({
      customer,
      vendor,
      community,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      grandTotal: grandTotal || 0,
      deliverySlot
    });

    const savedOrder = await this.orderRepo.save(order);

    if (listedOrders?.length) {
      const orders = listedOrders.map(lo => this.listedOrderRepo.create({ ...lo, order: savedOrder }));
      await this.listedOrderRepo.save(orders);
      savedOrder.listedOrders = orders;
    }

    return savedOrder;
  }

  // async findAll(): Promise<Order[]> {
  //   return this.orderRepo.find({ relations: ['customer', 'vendor','listedOrders.product', 'community', 'listedOrders', 'payments'] });
  // }
  async findAll(filters: OrderFilter): Promise<Order[]> {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.vendor', 'vendor')
      .leftJoinAndSelect('order.community', 'community')
      .leftJoinAndSelect('order.listedOrders', 'listedOrders')
      .leftJoinAndSelect('listedOrders.product', 'product')
      .leftJoinAndSelect('order.payments', 'payments')
      .where('order.isDeleted = false');

    if (filters.customerId) {
      qb.andWhere('order.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters.vendorId) {
      qb.andWhere('order.vendorId = :vendorId', { vendorId: filters.vendorId });
    }

    if (filters.communityId) {
      qb.andWhere('order.communityId = :communityId', { communityId: filters.communityId });
    }

    if (filters.orderStatus) {
      qb.andWhere('order.orderStatus = :orderStatus', { orderStatus: filters.orderStatus });
    }

    if (filters.paymentStatus) {
      qb.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: filters.paymentStatus });
    }

    if (filters.startDate) {
      qb.andWhere('order.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      qb.andWhere('order.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters.deliveryDate) {
      qb.andWhere('order.deliveryDate = :deliveryDate', { deliveryDate: filters.deliveryDate });
    }

    qb.orderBy('order.createdAt', 'DESC');

    return qb.getMany();
  }
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['customer', 'vendor', 'community', 'listedOrders', 'payments'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
  async findOneByVendorServicePlan(
    id: number,
    customerId: number,
  ): Promise<ListedOrder[]> {
    const order = await this.orderRepo.findOne({
      where: {
        vendorSubscriptionPlan: { id },
        customer: { id: customerId },
      },
      relations: [
        // 'customer',
        // 'vendor',
        // 'community',
        'listedOrders',
        'listedOrders.product',
        // 'payments',
      ],
      order: {
        id: 'DESC',
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order.listedOrders;
  }


  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return this.orderRepo.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    order.isDeleted = true;
    await this.orderRepo.save(order);
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { customer: { id: customerId }, isDeleted: false },
      relations: ['vendor', 'community', 'listedOrders', 'payments'],
    });
  }

  async getOrdersByVendor(vendorId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { vendor: { id: vendorId }, isDeleted: false },
      relations: ['customer', 'community', 'listedOrders', 'payments'],
    });
  }

  async findPendingByProductId(productId: number): Promise<Order[]> {
    return this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.listedOrders', 'listedOrders')
      .leftJoinAndSelect('listedOrders.product', 'product')
      .where('product.id = :productId', { productId })
      .andWhere('order.orderStatus IN (:...statuses)', {
        statuses: ['PENDING', 'CONFIRMED', 'PROCESSING'],
      })
      .andWhere('order.isDeleted = false')
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }
}
