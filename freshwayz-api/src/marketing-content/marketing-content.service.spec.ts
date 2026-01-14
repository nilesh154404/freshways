import { Test, TestingModule } from '@nestjs/testing';
import { MarketingContentService } from './marketing-content.service';

describe('MarketingContentService', () => {
  let service: MarketingContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketingContentService],
    }).compile();

    service = module.get<MarketingContentService>(MarketingContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
