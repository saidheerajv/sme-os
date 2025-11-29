import { Test, TestingModule } from '@nestjs/testing';
import { EntityDefinitionsService } from './entity-definitions.service';

describe('EntityDefinitionsService', () => {
  let service: EntityDefinitionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntityDefinitionsService],
    }).compile();

    service = module.get<EntityDefinitionsService>(EntityDefinitionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
