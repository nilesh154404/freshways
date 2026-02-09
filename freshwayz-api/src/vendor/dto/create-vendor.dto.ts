import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateVendorDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    businessName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    gstNumber?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    website?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    ownerName?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    bankName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    accountNumber: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    ifscCode: string;

    @ApiProperty({ required: false, type: [Number] })
    @IsOptional()
    @IsArray()
    categories?: number[];
}
