// Health check endpoint — confirms the API is running.
import { Controller, Get } from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';

interface HealthData {
  status: string;
  uptime: number;
}

@Controller()
export class AppController {
  /** Liveness probe — returns ok status and process uptime. */
  @Public()
  @Get('health')
  getHealth(): HealthData {
    return {
      status: 'ok',
      uptime: process.uptime(),
    };
  }
}
