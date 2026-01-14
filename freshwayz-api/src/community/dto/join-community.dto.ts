import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class JoinCommunityDto {

  @ApiProperty()
  @IsNumber()
  customerId: number;
}
