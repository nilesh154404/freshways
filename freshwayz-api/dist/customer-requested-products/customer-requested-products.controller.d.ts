import { CustomerRequestedProductsService } from './customer-requested-products.service';
import { CreateCustomerRequestedProductDto } from './dto/create-customer-requested-product.dto';
import { UpdateCustomerRequestedProductDto } from './dto/update-customer-requested-product.dto';
export declare class CustomerRequestedProductsController {
    private readonly customerRequestedProductsService;
    constructor(customerRequestedProductsService: CustomerRequestedProductsService);
    create(createCustomerRequestedProductDto: CreateCustomerRequestedProductDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateCustomerRequestedProductDto: UpdateCustomerRequestedProductDto): string;
    remove(id: string): string;
}
