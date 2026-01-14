import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRequestedProductsController } from './customer-requested-products.controller';
import { CustomerRequestedProductsService } from './customer-requested-products.service';

describe('CustomerRequestedProductsController', () => {
  let controller: CustomerRequestedProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerRequestedProductsController],
      providers: [CustomerRequestedProductsService],
    }).compile();

    controller = module.get<CustomerRequestedProductsController>(CustomerRequestedProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
