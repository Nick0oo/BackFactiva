import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './entities/role.entity'; // Asegúrate de que la ruta sea correcta

@Module({
  imports: [ MongooseModule.forFeature([
        { name: Role.name, schema: RoleSchema }, // Registro del modelo Role
      ])
    
  ], // Aquí puedes importar otros módulos si es necesario
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService], // Exporta el servicio para que pueda ser utilizado en otros módulos
})
export class RolesModule {}
