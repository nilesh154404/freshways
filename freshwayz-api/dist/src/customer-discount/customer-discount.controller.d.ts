import { CustomerDiscountService } from './customer-discount.service';
import { CreateCustomerDiscountDto } from './dto/create-customer-discount.dto';
import { UpdateCustomerDiscountDto } from './dto/update-customer-discount.dto';
export declare class CustomerDiscountController {
    private readonly customerDiscountService;
    constructor(customerDiscountService: CustomerDiscountService);
    create(createCustomerDiscountDto: CreateCustomerDiscountDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateCustomerDiscountDto: UpdateCustomerDiscountDto): string;
    remove(id: string): string;
}
