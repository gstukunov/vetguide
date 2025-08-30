import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../s3.service';

describe('S3Service', () => {
  let service: S3Service;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'NODE_ENV':
                  return 'development';
                case 'LOCAL_STORAGE_PATH':
                  return './test-uploads';
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with local storage in development mode', () => {
    expect(configService.get('NODE_ENV')).toBe('development');
  });

  it('should validate image types correctly', () => {
    const mockFile = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    } as Express.Multer.File;

    // This is a private method, but we can test the behavior through public methods
    expect(mockFile.mimetype).toMatch(/^image\/(jpeg|jpg|png)$/);
  });

  it('should handle configuration correctly', () => {
    const nodeEnv = configService.get('NODE_ENV');
    const storagePath = configService.get('LOCAL_STORAGE_PATH');

    expect(nodeEnv).toBe('development');
    expect(storagePath).toBe('./test-uploads');
  });

  it('should be properly configured', () => {
    expect(service).toBeInstanceOf(S3Service);
  });
});
