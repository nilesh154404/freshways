import { ApiProperty } from "@nestjs/swagger";

export class VendorResponseDto {

    @ApiProperty()
    id: number;

    @ApiProperty()
    businessName: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    gstNumber?: string;

    @ApiProperty()
    ownerName?: string;

    @ApiProperty()
    address?: string;

    @ApiProperty()
    userType: string;
}
