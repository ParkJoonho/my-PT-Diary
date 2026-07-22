import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { DatabaseService } from './database/database.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: DatabaseService,
          useValue: {
            ping: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should return service metadata', () => {
    expect(appController.getIndex()).toEqual({
      service: 'at-pt-server',
      docs: '/docs',
      health: '/health',
    });
  });
});
