import { Test, TestingModule } from '@nestjs/testing';
import { ListedOrderController } from './listed-order.controller';
import { ListedOrderService } from './listed-order.service';

describe('ListedOrderController', () => {
  let controller: ListedOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListedOrderController],
      providers: [ListedOrderService],
    }).compile();

    controller = module.get<ListedOrderController>(ListedOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
