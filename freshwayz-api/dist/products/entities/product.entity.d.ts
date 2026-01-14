import { Categories } from "src/categories/categories.entity";
import { DailyPrice } from "src/daily-price/entities/daily-price.entity";
import { ProductDiscount } from "src/product-discount/entities/product-discount.entity";
import { ServiceOffering } from "src/service-offering/entities/service-offering.entity";
import { VendorSubscriptionPlan } from "src/vendor-subscription-plan/entities/vendor-subscription-plan.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
export declare class Product {
    id: number;
    label: string;
    description: string;
    productUrl: string;
    measurementUnit: string;
    measurementValue: string;
    serviceOffering: ServiceOffering;
    dailyPrices: DailyPrice[];
    vendor: Vendor;
    vendorSubscriptionPlan: VendorSubscriptionPlan;
    category: Categories;
    discounts: ProductDiscount[];
}
