import { CreateCustomerDiscountDto } from './dto/create-customer-discount.dto';
import { UpdateCustomerDiscountDto } from './dto/update-customer-discount.dto';
export declare class CustomerDiscountService {
    create(createCustomerDiscountDto: CreateCustomerDiscountDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateCustomerDiscountDto: UpdateCustomerDiscountDto): string;
    remove(id: number): string;
}
