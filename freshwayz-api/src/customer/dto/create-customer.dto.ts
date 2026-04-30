import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCustomerDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false, example: "1998-11-14" })
    @IsOptional()
    @IsDateString()
    dob?: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    goal?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    community?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    landmark?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    locality?: string;
}
