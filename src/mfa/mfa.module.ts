import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { UsersModule } from '../users/users.module'; // ¡Asegúrate de la ruta correcta!

@Module({
  imports: [UsersModule], // ¡Importa UsersModule aquí!
  providers: [MfaService],
  exports: [MfaService],
})
export class MfaModule {}