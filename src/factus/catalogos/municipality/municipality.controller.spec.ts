import { Test, TestingModule } from '@nestjs/testing';
import { MunicipalityController } from './municipality.controller';

describe('MunicipalityController', () => {
  let controller: MunicipalityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MunicipalityController],
    }).compile();

    controller = module.get<MunicipalityController>(MunicipalityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
