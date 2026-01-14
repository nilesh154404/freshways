import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommunityDto {
    @ApiProperty({ example: 'Green Valley Society' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'green-valley-society' })
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty({ example: 'COMMERCIAL' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ example: '123 Street, Area, City' })
    @IsString()
    @IsNotEmpty()
    address: string;
}
