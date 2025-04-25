// filepath: g:\Proyecto de software 3\Back-factiva\src\dashboard\dashboard.module.ts
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {} // Cambiado de "Module" a "DashboardModule"