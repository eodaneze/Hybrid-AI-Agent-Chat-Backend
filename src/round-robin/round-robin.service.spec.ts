import { Test, TestingModule } from '@nestjs/testing';
import { RoundRobinService } from './round-robin.service';

describe('RoundRobinService', () => {
  let service: RoundRobinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoundRobinService],
    }).compile();

    service = module.get<RoundRobinService>(RoundRobinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
