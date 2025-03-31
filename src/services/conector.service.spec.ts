import { Test, TestingModule } from '@nestjs/testing';
import { ConectorService } from './conector.service';

describe('ConectorService', () => {
  let service: ConectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConectorService],
    }).compile();

    service = module.get<ConectorService>(ConectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
