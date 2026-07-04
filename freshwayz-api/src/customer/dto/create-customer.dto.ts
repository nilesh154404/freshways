import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateCustomerDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone: string;

    @ApiProperty({ example: "1998-11-14" })
    @IsDateString()
    dob: Date;

    @ApiProperty()
    @IsString()
    gender: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    flatNo?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    floorNo?: string;

    @ApiProperty()
    @IsString()
    address: string;
}
