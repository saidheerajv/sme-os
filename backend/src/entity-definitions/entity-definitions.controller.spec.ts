import { Test, TestingModule } from '@nestjs/testing';
import { EntityDefinitionsController } from './entity-definitions.controller';

describe('EntityDefinitionsController', () => {
  let controller: EntityDefinitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntityDefinitionsController],
    }).compile();

    controller = module.get<EntityDefinitionsController>(EntityDefinitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
