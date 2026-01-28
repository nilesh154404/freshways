import { Module, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UserTypeModule } from './user-type/user-type.module';
import { VendorModule } from './vendor/vendor.module';
import { CustomerModule } from './customer/customer.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { CustomerDiscountModule } from './customer-discount/customer-discount.module';
import { CustomerRequestedProductsModule } from './customer-requested-products/customer-requested-products.module';
import { VendorSubscriptionPlanModule } from './vendor-subscription-plan/vendor-subscription-plan.module';
import { VendorProductsModule } from './vendor-products/vendor-products.module';
import { DailyPriceModule } from './daily-price/daily-price.module';
import { OrdersModule } from './orders/orders.module';
import { OrderReturnModule } from './order-return/order-return.module';
import { ServiceOfferingModule } from './service-offering/service-offering.module';
import { ProductsModule } from './products/products.module';
import { PriceConfigurationModule } from './price-configuration/price-configuration.module';
import { ListedOrderModule } from './listed-order/listed-order.module';
import { CommunityModule } from './community/community.module';
import { PaymentsModule } from './payments/payments.module';
import { CategoriesModule } from './categories/categories.module';
import { CommunityMessageModule } from './community-message/community-message.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { MarketingContentModule } from './marketing-content/marketing-content.module';
import { DeliverySlotsModule } from './delivery-slot/delivery-slot.module';
import { ProductDiscountModule } from './product-discount/product-discount.module';
import { CustomerProductListModule } from './customer-product-list/customer-product-list.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true
      }),
    }),
    AuthModule,
    UserModule,
    UserTypeModule,
    VendorModule,
    CustomerModule,
    SubscriptionModule,
    CustomerDiscountModule,
    CustomerRequestedProductsModule,
    VendorSubscriptionPlanModule,
    VendorProductsModule,
    DailyPriceModule,
    OrdersModule,
    OrderReturnModule,
    ServiceOfferingModule,
    ProductsModule,
    PriceConfigurationModule,
    ListedOrderModule,
    CommunityModule,
    PaymentsModule,
    CategoriesModule,
    CommunityMessageModule,
    FileUploadModule,
    MarketingContentModule,
    DeliverySlotsModule,
    ProductDiscountModule,
    CustomerProductListModule
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) { }

  async onModuleInit() {
    console.log('✅ DataSource initialized:', this.dataSource.isInitialized);
  }
}
