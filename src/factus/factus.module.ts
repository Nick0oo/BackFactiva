// factus.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { FactusController } from './factus.controller';
import { FactusService } from './factus.service';
import { InvoiceModule } from '../dashboard/invoice/invoice.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    forwardRef(() => InvoiceModule),
  ],
  controllers: [FactusController],
  providers: [FactusService],
  exports: [FactusService],
})
export class FactusModule {}