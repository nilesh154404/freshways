import { Module } from '@nestjs/common';
import { CommunityMessageService } from './community-message.service';
import { CommunityMessageController } from './community-message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityMessage } from './entities/community-message.entity';
import { CommunityChatGateway } from './community-chat.gateway';
import { CommunityService } from 'src/community/community.service';
import { Community } from 'src/community/entities/community.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityMessage, Community]),
  ],
  controllers: [CommunityMessageController],
  providers: [CommunityMessageService, CommunityChatGateway, CommunityService],
})
export class CommunityMessageModule { }
