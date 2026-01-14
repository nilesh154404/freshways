import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRequestedProductsService } from './customer-requested-products.service';

describe('CustomerRequestedProductsService', () => {
  let service: CustomerRequestedProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerRequestedProductsService],
    }).compile();

    service = module.get<CustomerRequestedProductsService>(CustomerRequestedProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
