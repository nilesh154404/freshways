import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateVendorDto } from './create-vendor.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateVendorDto extends PartialType(CreateVendorDto) {

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    userTypeId?: number;
}
