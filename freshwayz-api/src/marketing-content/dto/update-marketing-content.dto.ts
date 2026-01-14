import { PartialType } from '@nestjs/swagger';
import { CreateMarketingContentDto } from './create-marketing-content.dto';

export class UpdateMarketingContentDto extends PartialType(CreateMarketingContentDto) {}
