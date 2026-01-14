import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateVendorDto } from './create-vendor.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateVendorDto extends PartialType(CreateVendorDto) {

    @ApiProperty()
    @IsNotEmpty()
    userTypeId: number;
}
