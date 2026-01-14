import { Test, TestingModule } from '@nestjs/testing';
import { CommunityMessageService } from './community-message.service';

describe('CommunityMessageService', () => {
  let service: CommunityMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunityMessageService],
    }).compile();

    service = module.get<CommunityMessageService>(CommunityMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
