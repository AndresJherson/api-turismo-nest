import { Test, TestingModule } from '@nestjs/testing';
import { ConectorGoogleService } from './conector-google.service';

describe('ConectorGoogleService', () => {
  let service: ConectorGoogleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConectorGoogleService],
    }).compile();

    service = module.get<ConectorGoogleService>(ConectorGoogleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
