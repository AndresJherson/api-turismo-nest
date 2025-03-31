import { Test, TestingModule } from '@nestjs/testing';
import { GuiaService } from './guia.service';

describe('GuiaService', () => {
  let service: GuiaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuiaService],
    }).compile();

    service = module.get<GuiaService>(GuiaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
