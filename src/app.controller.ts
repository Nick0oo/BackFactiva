import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller for the main application.
 * This controller is responsible for:
 * - Handling the root endpoint
 * - Handling the test endpoint
 **/
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  public getHello(): string {
    return this.appService.getHello();
  }

  // Agregando un nuevo endpoint de prueba
  @Get('test')
  public getTest(): string {
    return 'Test endpoint working!';
  }
}