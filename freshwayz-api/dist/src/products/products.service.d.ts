import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { VendorSubscriptionPlan } from 'src/vendor-subscription-plan/entities/vendor-subscription-plan.entity';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';
import { Categories } from 'src/categories/categories.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
export declare class ProductsService {
    private readonly productRepo;
    private readonly serviceOfferingRepo;
    private readonly vendorPlanRepo;
    private readonly categoryRepo;
    private readonly vendorRepo;
    constructor(productRepo: Repository<Product>, serviceOfferingRepo: Repository<ServiceOffering>, vendorPlanRepo: Repository<VendorSubscriptionPlan>, categoryRepo: Repository<Categories>, vendorRepo: Repository<Vendor>);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(dto: RangeDTO, categoryId?: number, vendorId?: number): Promise<import("../helpers/pagination/dto/pagination.dto").Pagination<Product>>;
    findOne(id: number): Promise<Product | null>;
    update(id: number, dto: any): string;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
