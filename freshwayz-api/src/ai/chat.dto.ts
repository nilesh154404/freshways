// import { ApiProperty } from '@nestjs/swagger';

// export class ChatDto {
//   @ApiProperty({
//     description: 'Message to send to AI',
//     example: 'Suggest fruits',
//   })
//   message: string;
// }4

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChatDto {
  @ApiProperty({
    example: 'Suggest fruits',
    description: 'Message to send to AI',
  })

  @IsString()
  @IsNotEmpty()
  message: string;
}