import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength, ValidateNested, IsOptional, IsNumber, IsArray } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';



export class RegisterCustomerDto {
    @ApiProperty({ type: CreateCustomerDto })
    @ValidateNested()
    @Type(() => CreateCustomerDto)
    customer: CreateCustomerDto;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    username: string;
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;
}