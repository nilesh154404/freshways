import { Test, TestingModule } from '@nestjs/testing';
import { CustomerDiscountController } from './customer-discount.controller';
import { CustomerDiscountService } from './customer-discount.service';

describe('CustomerDiscountController', () => {
  let controller: CustomerDiscountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerDiscountController],
      providers: [CustomerDiscountService],
    }).compile();

    controller = module.get<CustomerDiscountController>(CustomerDiscountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
