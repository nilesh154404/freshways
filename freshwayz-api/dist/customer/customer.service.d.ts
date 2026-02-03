import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
export declare class CustomerService {
    private readonly customerRepository;
    constructor(customerRepository: Repository<Customer>);
    create(createCustomerDto: CreateCustomerDto): string;
    findAll(): string;
    getCustomersCount(): Promise<{
        total: number;
        growth: number;
        newThisMonth: number;
    }>;
    findOne(id: number): string;
    updateCustomer(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    remove(id: number): string;
}
