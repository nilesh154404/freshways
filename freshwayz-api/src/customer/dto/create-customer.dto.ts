import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsNotEmpty, IsString } from "class-validator";

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

    @ApiProperty()
    @IsString()
    address: string;
}
