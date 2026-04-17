import { Test, TestingModule } from '@nestjs/testing';
import { BidController } from './bid.controller';

describe('BidController', () => {
  let controller: BidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BidController],
    }).compile();

    controller = module.get<BidController>(BidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
