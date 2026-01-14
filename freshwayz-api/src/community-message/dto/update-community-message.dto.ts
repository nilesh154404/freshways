import { PartialType } from '@nestjs/swagger';
import { CreateCommunityMessageDto } from './create-community-message.dto';

export class UpdateCommunityMessageDto extends PartialType(CreateCommunityMessageDto) {}
