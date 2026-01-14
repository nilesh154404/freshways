import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateVendorDto } from "./create-vendor.dto";

export class RegisterVendorDto {

    @ApiProperty({ type: CreateVendorDto })
    @ValidateNested()
    @Type(() => CreateVendorDto)
    vendor: CreateVendorDto;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;
}
