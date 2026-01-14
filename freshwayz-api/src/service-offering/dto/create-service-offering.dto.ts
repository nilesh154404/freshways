import { IsString, Length } from 'class-validator';

export class CreateServiceOfferingDto {
  @IsString()
  @Length(1, 10)
  serviceCode: string;

  @IsString()
  @Length(1, 20)
  serviceName: string;

  @IsString()
  @Length(1, 150)
  description: string;
}
