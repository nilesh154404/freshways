import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UserTypeService } from './user-type.service';
import { CreateUserTypeDto } from './dto/create-user-type.dto';
import { UpdateUserTypeDto } from './dto/update-user-type.dto';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@Controller('user-type')
export class UserTypeController {
  constructor(private readonly userTypeService: UserTypeService) {}

  @Post()
  create(@Body() createUserTypeDto: CreateUserTypeDto) {
    return this.userTypeService.create(createUserTypeDto);
  }

  @Get()
  findAll(@Query() dto: RangeDTO) {
    return this.userTypeService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserTypeDto: UpdateUserTypeDto) {
    return this.userTypeService.update(+id, updateUserTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userTypeService.remove(+id);
  }
}
