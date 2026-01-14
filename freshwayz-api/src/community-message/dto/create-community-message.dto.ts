import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCommunityMessageDto {
    @ApiProperty()
    @IsNumber()
    customerId: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    message: string;
}
