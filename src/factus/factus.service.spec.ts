import { Test, TestingModule } from '@nestjs/testing';
import { FactusService } from './factus.service';

describe('FactusService', () => {
  let service: FactusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FactusService],
    }).compile();

    service = module.get<FactusService>(FactusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
