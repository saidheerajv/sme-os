import { Test, TestingModule } from '@nestjs/testing';
import { DynamicEntitiesController } from './dynamic-entities.controller';

describe('DynamicEntitiesController', () => {
  let controller: DynamicEntitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DynamicEntitiesController],
    }).compile();

    controller = module.get<DynamicEntitiesController>(DynamicEntitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
