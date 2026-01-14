import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Community } from 'src/community/entities/community.entity';
import { ListedOrder } from 'src/listed-order/entities/listed-order.entity';
import { OrderService } from './orders.service';
import { OrderController } from './orders.controller';
import { Product } from 'src/products/entities/product.entity';
import { DeliverySlot } from 'src/delivery-slot/entities/delivery-slot.entity';
import { VendorSubscriptionPlan } from 'src/vendor-subscription-plan/entities/vendor-subscription-plan.entity';
import { ProductDiscountService } from 'src/product-discount/product-discount.service';
import { DailyPrice } from 'src/daily-price/entities/daily-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Customer, Vendor, Community, Product, ListedOrder, DeliverySlot, VendorSubscriptionPlan, DailyPrice])],
  controllers: [OrderController],
  providers: [OrderService, ProductDiscountService],
})
export class OrdersModule { }
