import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

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
    ownerName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    nickname?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    whatsapp?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    telegram?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    website?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    bankAccountNumber?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    ifscCode?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    bankName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    accountHolderName?: string;

    @ApiProperty({ required: false, type: [Number] })
    @IsOptional()
    categories?: number[];
}
