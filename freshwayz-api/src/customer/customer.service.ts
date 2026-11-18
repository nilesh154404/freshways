import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { UserType } from 'src/user-type/entities/user-type.entity';
import { paginate, PaginatedResponse } from 'src/helpers/pagination/pagination';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

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

  /**
   * Returns ALL customers (active + soft-deleted).
   * Admin can see account status via the isActive / deletedAt fields.
   */
  async findAll(dto?: RangeDTO): Promise<PaginatedResponse<Customer>> {
    const qb = this.customerRepository.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.userType', 'userType')
      .orderBy('customer.createdAt', 'DESC')
      .addOrderBy('customer.id', 'DESC');

    return paginate(qb, dto);
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

  /**
   * Soft-deletes a customer account.
   * Sets isActive=false and deletedAt=now. The record stays in the DB.
   * This is for CUSTOMER self-deletion only (not vendor/admin).
   */
  async remove(id: number): Promise<{ message: string }> {
    const customer = await this.customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    if (!customer.isActive) {
      throw new BadRequestException(`Customer account with ID ${id} is already deactivated`);
    }

    customer.isActive = false;
    customer.deletedAt = new Date();
    await this.customerRepository.save(customer);

    return {
      message: 'Account deleted successfully. Your data has been retained but your account has been deactivated.',
    };
  }
}
