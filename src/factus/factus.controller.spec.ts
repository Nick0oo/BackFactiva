import { Test, TestingModule } from '@nestjs/testing';
import { FactusController } from './factus.controller';

describe('FactusController', () => {
  let controller: FactusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FactusController],
    }).compile();

    controller = module.get<FactusController>(FactusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
