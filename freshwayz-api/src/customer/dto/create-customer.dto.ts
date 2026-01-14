import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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
    bloodGroup?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    height?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    weight?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    medicalHistory?: string;

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
