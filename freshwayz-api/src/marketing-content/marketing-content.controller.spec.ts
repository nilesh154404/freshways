import { Test, TestingModule } from '@nestjs/testing';
import { MarketingContentController } from './marketing-content.controller';
import { MarketingContentService } from './marketing-content.service';

describe('MarketingContentController', () => {
  let controller: MarketingContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketingContentController],
      providers: [MarketingContentService],
    }).compile();

    controller = module.get<MarketingContentController>(MarketingContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
