import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) { }

  create(createCustomerDto: CreateCustomerDto) {
    return 'This action adds a new customer';
  }

  findAll() {
    return `This action returns all customer`;
  }

  async getCustomersCount() {
    const total = await this.customerRepository.count();

    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const newThisMonth = await this.customerRepository.count({
      where: {
        createdAt: MoreThanOrEqual(firstDayCurrentMonth),
      }
    });

    const newLastMonth = await this.customerRepository.count({
      where: {
        createdAt: Between(firstDayLastMonth, lastDayLastMonth),
      }
    });

    let growth = 0;
    if (newLastMonth > 0) {
      growth = ((newThisMonth - newLastMonth) / newLastMonth) * 100;
    } else if (newThisMonth > 0) {
      growth = 100;
    }

    return { total, growth: Math.round(growth), newThisMonth };
  }

  findOne(id: number) {
    return `This action returns a #${id} customer`;
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
