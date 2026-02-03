"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const user_type_module_1 = require("./user-type/user-type.module");
const vendor_module_1 = require("./vendor/vendor.module");
const customer_module_1 = require("./customer/customer.module");
const subscription_module_1 = require("./subscription/subscription.module");
const customer_discount_module_1 = require("./customer-discount/customer-discount.module");
const customer_requested_products_module_1 = require("./customer-requested-products/customer-requested-products.module");
const vendor_subscription_plan_module_1 = require("./vendor-subscription-plan/vendor-subscription-plan.module");
const vendor_products_module_1 = require("./vendor-products/vendor-products.module");
const daily_price_module_1 = require("./daily-price/daily-price.module");
const orders_module_1 = require("./orders/orders.module");
const order_return_module_1 = require("./order-return/order-return.module");
const service_offering_module_1 = require("./service-offering/service-offering.module");
const products_module_1 = require("./products/products.module");
const price_configuration_module_1 = require("./price-configuration/price-configuration.module");
const listed_order_module_1 = require("./listed-order/listed-order.module");
const community_module_1 = require("./community/community.module");
const payments_module_1 = require("./payments/payments.module");
const categories_module_1 = require("./categories/categories.module");
const community_message_module_1 = require("./community-message/community-message.module");
const file_upload_module_1 = require("./file-upload/file-upload.module");
const marketing_content_module_1 = require("./marketing-content/marketing-content.module");
const delivery_slot_module_1 = require("./delivery-slot/delivery-slot.module");
const product_discount_module_1 = require("./product-discount/product-discount.module");
const seeder_module_1 = require("./seeder/seeder.module");
let AppModule = class AppModule {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onModuleInit() {
        console.log('✅ DataSource initialized:', this.dataSource.isInitialized);
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_2.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'mysql',
                    host: config.get('DB_HOST'),
                    port: config.get('DB_PORT'),
                    username: config.get('DB_USER'),
                    password: config.get('DB_PASS'),
                    database: config.get('DB_NAME'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true,
                    autoLoadEntities: true
                }),
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            user_type_module_1.UserTypeModule,
            vendor_module_1.VendorModule,
            customer_module_1.CustomerModule,
            subscription_module_1.SubscriptionModule,
            customer_discount_module_1.CustomerDiscountModule,
            customer_requested_products_module_1.CustomerRequestedProductsModule,
            vendor_subscription_plan_module_1.VendorSubscriptionPlanModule,
            vendor_products_module_1.VendorProductsModule,
            daily_price_module_1.DailyPriceModule,
            orders_module_1.OrdersModule,
            order_return_module_1.OrderReturnModule,
            service_offering_module_1.ServiceOfferingModule,
            products_module_1.ProductsModule,
            price_configuration_module_1.PriceConfigurationModule,
            listed_order_module_1.ListedOrderModule,
            community_module_1.CommunityModule,
            payments_module_1.PaymentsModule,
            categories_module_1.CategoriesModule,
            community_message_module_1.CommunityMessageModule,
            file_upload_module_1.FileUploadModule,
            marketing_content_module_1.MarketingContentModule,
            delivery_slot_module_1.DeliverySlotsModule,
            delivery_slot_module_1.DeliverySlotsModule,
            product_discount_module_1.ProductDiscountModule,
            seeder_module_1.SeederModule
        ],
    }),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AppModule);
//# sourceMappingURL=app.module.js.map