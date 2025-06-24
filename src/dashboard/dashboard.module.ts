import { Module } from '@nestjs/common';
import { InvoiceModule } from './invoice/invoice.module';
import { ProductsModule } from './products/products.module';
import { InvoicePartiesModule } from './invoice_parties/invoice_parties.module';
import { DashboardController } from './dashboard.controller'; // Si tienes un controlador de dashboard
import { DashboardService } from './dashboard.service';     // Si tienes un servicio de dashboard
import { JwtConfigModule } from 'src/jwt/jwt.module';
import { UsersModule } from 'src/users/users.module'; // Asegúrate de importar el módulo de usuarios

@Module({
  imports: [InvoiceModule, ProductsModule, InvoicePartiesModule, JwtConfigModule, UsersModule], 
  controllers: [DashboardController], // Si existe
  providers: [DashboardService],     // Si existe
})
export class DashboardModule {}