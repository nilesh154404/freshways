import { Test, TestingModule } from '@nestjs/testing';
import { DeliverySlotService } from './delivery-slot.service';

describe('DeliverySlotService', () => {
  let service: DeliverySlotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliverySlotService],
    }).compile();

    service = module.get<DeliverySlotService>(DeliverySlotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
