import { Test, TestingModule } from '@nestjs/testing';
import { PriceConfigurationService } from './price-configuration.service';

describe('PriceConfigurationService', () => {
  let service: PriceConfigurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceConfigurationService],
    }).compile();

    service = module.get<PriceConfigurationService>(PriceConfigurationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
