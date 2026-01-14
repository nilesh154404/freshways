import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {

    @ApiProperty()
    id: number;

    @ApiProperty()
    fullName: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    phone?: string;
}
