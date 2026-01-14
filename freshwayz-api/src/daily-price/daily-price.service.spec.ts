import { Test, TestingModule } from '@nestjs/testing';
import { DailyPriceService } from './daily-price.service';

describe('DailyPriceService', () => {
  let service: DailyPriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyPriceService],
    }).compile();

    service = module.get<DailyPriceService>(DailyPriceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
