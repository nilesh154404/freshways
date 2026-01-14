import { Test, TestingModule } from '@nestjs/testing';
import { OrderReturnController } from './order-return.controller';
import { OrderReturnService } from './order-return.service';

describe('OrderReturnController', () => {
  let controller: OrderReturnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderReturnController],
      providers: [OrderReturnService],
    }).compile();

    controller = module.get<OrderReturnController>(OrderReturnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
