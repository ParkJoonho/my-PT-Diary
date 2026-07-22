import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller';
import { DatabaseService } from '../database/database.service';

describe('애플리케이션 컨트롤러', () => {
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

  it('서비스 기본 정보를 반환한다', () => {
    expect(appController.getIndex()).toEqual({
      service: 'at-pt-server',
      docs: '/docs',
      health: '/health',
    });
  });
});
