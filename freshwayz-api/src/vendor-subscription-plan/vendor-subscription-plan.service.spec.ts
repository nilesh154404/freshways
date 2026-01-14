import { Test, TestingModule } from '@nestjs/testing';
import { VendorSubscriptionPlanService } from './vendor-subscription-plan.service';

describe('VendorSubscriptionPlanService', () => {
  let service: VendorSubscriptionPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorSubscriptionPlanService],
    }).compile();

    service = module.get<VendorSubscriptionPlanService>(VendorSubscriptionPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
