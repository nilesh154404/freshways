import { Test, TestingModule } from '@nestjs/testing';
import { VendorProductsService } from './vendor-products.service';

describe('VendorProductsService', () => {
  let service: VendorProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorProductsService],
    }).compile();

    service = module.get<VendorProductsService>(VendorProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
