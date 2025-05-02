import { Test, TestingModule } from '@nestjs/testing';
import { StandarCodeController } from './standar-code.controller';
import { StandarCodeService } from './standard-code.service';

describe('StandarCodeController', () => {
  let controller: StandarCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StandarCodeController],
      providers: [StandarCodeService],
    }).compile();

    controller = module.get<StandarCodeController>(StandarCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
