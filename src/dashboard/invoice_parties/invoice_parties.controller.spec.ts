import { Test, TestingModule } from '@nestjs/testing';
import { InvoicePartiesController } from './invoice_parties.controller';
import { InvoicePartiesService } from './invoice_parties.service';

describe('InvoicePartiesController', () => {
  let controller: InvoicePartiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicePartiesController],
      providers: [InvoicePartiesService],
    }).compile();

    controller = module.get<InvoicePartiesController>(InvoicePartiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
