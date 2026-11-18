import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserTypeDto } from './dto/create-user-type.dto';
import { UpdateUserTypeDto } from './dto/update-user-type.dto';
import { UserType } from './entities/user-type.entity';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';
import { paginate } from 'src/helpers/pagination/pagination';

@Injectable()
export class UserTypeService {
  constructor(
    @InjectRepository(UserType)
    private readonly userTypeRepo: Repository<UserType>,
  ) {}

  create(createUserTypeDto: CreateUserTypeDto) {
    return 'This action adds a new userType';
  }

  async findAll(dto?: RangeDTO) {
    const qb = this.userTypeRepo
      .createQueryBuilder('ut')
      .orderBy('ut.createdAt', 'DESC')
      .addOrderBy('ut.id', 'DESC');
    return await paginate(qb, dto);
  }

  findOne(id: number) {
    return `This action returns a #${id} userType`;
  }

  update(id: number, updateUserTypeDto: UpdateUserTypeDto) {
    return `This action updates a #${id} userType`;
  }

  remove(id: number) {
    return `This action removes a #${id} userType`;
  }
}
