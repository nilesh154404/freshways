import { Test, TestingModule } from '@nestjs/testing';
import { ListedOrderService } from './listed-order.service';

describe('ListedOrderService', () => {
  let service: ListedOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListedOrderService],
    }).compile();

    service = module.get<ListedOrderService>(ListedOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
