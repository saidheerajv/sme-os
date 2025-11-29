import { Test, TestingModule } from '@nestjs/testing';
import { DynamicEntitiesService } from './dynamic-entities.service';

describe('DynamicEntitiesService', () => {
  let service: DynamicEntitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DynamicEntitiesService],
    }).compile();

    service = module.get<DynamicEntitiesService>(DynamicEntitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
