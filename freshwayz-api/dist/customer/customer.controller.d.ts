import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    create(createCustomerDto: CreateCustomerDto): string;
    findAll(): string;
    findOne(id: string): string;
    updateCustomer(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    remove(id: string): string;
}
