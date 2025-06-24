import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  // Agregando un nuevo endpoint de prueba
  @Get('test')
  public getTest(): string {
    return 'Test endpoint working!';
  }
}