import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DatabaseService } from './database/database.service';

@ApiTags('system')
@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}

  @ApiOkResponse({
    schema: {
      example: {
        service: 'at-pt-server',
        docs: '/docs',
        health: '/health',
      },
    },
  })
  @Get()
  getIndex() {
    return {
      service: 'at-pt-server',
      docs: '/docs',
      health: '/health',
    };
  }

  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        database: 'connected',
      },
    },
  })
  @Get('health')
  async getHealth() {
    await this.databaseService.ping();

    return {
      status: 'ok',
      database: 'connected',
    };
  }
}
