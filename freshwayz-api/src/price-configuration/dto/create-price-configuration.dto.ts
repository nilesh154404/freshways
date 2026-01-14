import { IsString, Length, IsNumber } from 'class-validator';

export class CreatePriceConfigurationDto {
  @IsString()
  @Length(1, 50)
  label: string;

  @IsNumber()
  value: number;
}
