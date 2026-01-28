import { CustomerProductListService } from './customer-product-list.service';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
export declare class CustomerProductListController {
    private readonly service;
    constructor(service: CustomerProductListService);
    create(dto: CreateCustomerProductDto): Promise<import("./entities/customer-product.entity").CustomerProduct>;
    getByCustomer(customerId: number): Promise<import("./entities/customer-product.entity").CustomerProduct[]>;
    delete(id: number): Promise<import("./entities/customer-product.entity").CustomerProduct>;
}
