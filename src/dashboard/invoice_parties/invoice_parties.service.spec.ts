import { Test, TestingModule } from '@nestjs/testing';
import { InvoicePartiesService } from './invoice_parties.service';

describe('InvoicePartiesService', () => {
  let service: InvoicePartiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoicePartiesService],
    }).compile();

    service = module.get<InvoicePartiesService>(InvoicePartiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
