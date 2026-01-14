import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOfferingService } from './service-offering.service';

describe('ServiceOfferingService', () => {
  let service: ServiceOfferingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceOfferingService],
    }).compile();

    service = module.get<ServiceOfferingService>(ServiceOfferingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
