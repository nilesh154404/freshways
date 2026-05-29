import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { UserType } from 'src/user-type/entities/user-type.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(UserType)
    private readonly userTypeRepository: Repository<UserType>,
  ) { }

  async create(createCustomerDto: CreateCustomerDto) {
    const userType = await this.userTypeRepository.findOne({ where: { typeName: 'Customer' } });
    if (!userType) {
      throw new BadRequestException('UserType "Customer" not found');
    }

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      userType,
    });

    return this.customerRepository.save(customer);
  }

  async findAll() {
    return this.customerRepository.find({ relations: ['userType'] });
  }

  async findOne(id: number) {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['userType'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }


  async updateCustomer(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    Object.assign(customer, updateCustomerDto);

    return this.customerRepository.save(customer);
  }
  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
