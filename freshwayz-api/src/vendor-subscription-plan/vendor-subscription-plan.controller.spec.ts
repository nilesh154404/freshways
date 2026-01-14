import { Test, TestingModule } from '@nestjs/testing';
import { VendorSubscriptionPlanController } from './vendor-subscription-plan.controller';
import { VendorSubscriptionPlanService } from './vendor-subscription-plan.service';

describe('VendorSubscriptionPlanController', () => {
  let controller: VendorSubscriptionPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorSubscriptionPlanController],
      providers: [VendorSubscriptionPlanService],
    }).compile();

    controller = module.get<VendorSubscriptionPlanController>(VendorSubscriptionPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
