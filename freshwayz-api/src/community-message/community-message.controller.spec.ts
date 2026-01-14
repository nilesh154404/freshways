import { Test, TestingModule } from '@nestjs/testing';
import { CommunityMessageController } from './community-message.controller';
import { CommunityMessageService } from './community-message.service';

describe('CommunityMessageController', () => {
  let controller: CommunityMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityMessageController],
      providers: [CommunityMessageService],
    }).compile();

    controller = module.get<CommunityMessageController>(CommunityMessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
