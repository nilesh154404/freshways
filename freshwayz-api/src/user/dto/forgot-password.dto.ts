import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'The username (phone number or email) of the account' })
  @IsString()
  @IsNotEmpty()
  username: string;
}
