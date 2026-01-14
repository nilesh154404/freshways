import { Test, TestingModule } from '@nestjs/testing';
import { PriceConfigurationController } from './price-configuration.controller';
import { PriceConfigurationService } from './price-configuration.service';

describe('PriceConfigurationController', () => {
  let controller: PriceConfigurationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceConfigurationController],
      providers: [PriceConfigurationService],
    }).compile();

    controller = module.get<PriceConfigurationController>(PriceConfigurationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
