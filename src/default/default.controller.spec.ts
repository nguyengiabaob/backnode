import { Test, TestingModule } from '@nestjs/testing';
import { DefaultController } from './default.controller';
import { DefaultService } from './default.service';

describe('DefaultController', () => {
  let controller: DefaultController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefaultController],
      providers: [DefaultService],
    }).compile();

    controller = module.get<DefaultController>(DefaultController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
