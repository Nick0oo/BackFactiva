import { Test, TestingModule } from '@nestjs/testing';
import { StandardCodeService } from './standard-code.service';

describe('StandarCodeService', () => {
  let service: StandardCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StandardCodeService],
    }).compile();

    service = module.get<StandardCodeService>(StandardCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
