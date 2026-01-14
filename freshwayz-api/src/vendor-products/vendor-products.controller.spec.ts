import { Test, TestingModule } from '@nestjs/testing';
import { VendorProductsController } from './vendor-products.controller';
import { VendorProductsService } from './vendor-products.service';

describe('VendorProductsController', () => {
  let controller: VendorProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorProductsController],
      providers: [VendorProductsService],
    }).compile();

    controller = module.get<VendorProductsController>(VendorProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
