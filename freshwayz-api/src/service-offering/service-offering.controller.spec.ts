import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOfferingController } from './service-offering.controller';
import { ServiceOfferingService } from './service-offering.service';

describe('ServiceOfferingController', () => {
  let controller: ServiceOfferingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOfferingController],
      providers: [ServiceOfferingService],
    }).compile();

    controller = module.get<ServiceOfferingController>(ServiceOfferingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
