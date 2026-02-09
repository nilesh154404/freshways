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
    bankName?: string;

    @ApiProperty()
    accountNumber?: string;

    @ApiProperty()
    ifscCode?: string;

    @ApiProperty()
    address?: string;

    @ApiProperty()
    website?: string;

    @ApiProperty()
    userType: string;
}
