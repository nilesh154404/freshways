import { Test, TestingModule } from '@nestjs/testing';
import { CustomerDiscountService } from './customer-discount.service';

describe('CustomerDiscountService', () => {
  let service: CustomerDiscountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerDiscountService],
    }).compile();

    service = module.get<CustomerDiscountService>(CustomerDiscountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
