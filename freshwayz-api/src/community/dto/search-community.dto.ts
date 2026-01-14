import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SearchCommunityDto {
    @ApiProperty({ example: 'green', required: false })
    @IsString()
    keyword?: string;
}
