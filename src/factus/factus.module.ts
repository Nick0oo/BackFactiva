// factus.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { FactusService } from './factus.service';
import { FactusController } from './factus.controller';
import { HttpModule } from '@nestjs/axios';
import { InvoiceModule } from 'src/dashboard/invoice/invoice.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => InvoiceModule)
  ],
  providers: [FactusService],
  exports: [FactusService],
  controllers: [FactusController]
})
export class FactusModule {}