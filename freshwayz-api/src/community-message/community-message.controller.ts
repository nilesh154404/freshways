import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommunityMessageService } from './community-message.service';
import { CreateCommunityMessageDto } from './dto/create-community-message.dto';
import { UpdateCommunityMessageDto } from './dto/update-community-message.dto';
import { ApiTags } from '@nestjs/swagger';
import { JoinCommunityDto } from 'src/community/dto/join-community.dto';
import { CommunityService } from 'src/community/community.service';


@ApiTags('CommunityChats')
@Controller('community-message')
export class CommunityMessageController {
  constructor(private readonly communityMessageService: CommunityMessageService,
    private readonly communityService: CommunityService) { }

  @Post(":communityId/join")
  async join(
    @Param("communityId") communityId: number,
    @Body() body: JoinCommunityDto
  ) {
    return this.communityService.joinCommunity(
      communityId,
      body.customerId
    );
  }

  // GET /community-chat/1/chats → get history
  @Get(":communityId/chats")
  async getChats(@Param("communityId") communityId: number) {
    return await this.communityMessageService.getMessages(communityId);
  }

  // POST /community-chat/1/chat → send message
  @Post(":communityId/chat")
  async send(
    @Param("communityId") communityId: number,
    @Body() body: CreateCommunityMessageDto
  ) {
    return await this.communityMessageService.sendMessage(
      body.customerId,
      communityId,
      body.message
    );
  }

  @Post()
  create(@Body() createCommunityMessageDto: CreateCommunityMessageDto) {
    return this.communityMessageService.create(createCommunityMessageDto);
  }

  @Get()
  findAll() {
    return this.communityMessageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityMessageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommunityMessageDto: UpdateCommunityMessageDto) {
    return this.communityMessageService.update(+id, updateCommunityMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityMessageService.remove(+id);
  }
}
