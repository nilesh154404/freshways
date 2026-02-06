import { CreateCustomerRequestedProductDto } from './dto/create-customer-requested-product.dto';
import { UpdateCustomerRequestedProductDto } from './dto/update-customer-requested-product.dto';
export declare class CustomerRequestedProductsService {
    create(createCustomerRequestedProductDto: CreateCustomerRequestedProductDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateCustomerRequestedProductDto: UpdateCustomerRequestedProductDto): string;
    remove(id: number): string;
}
