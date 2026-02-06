/* import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
 */
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class UserTypeDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  id: number;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ type: UserTypeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserTypeDto)
  userType?: UserTypeDto;
}
