import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import {
  ImageProcessingOptions,
  ImageUploadResult,
} from './interfaces/interfaces';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;
  private isLocal: boolean;
  private localStoragePath: string;
  private endpoint: string;

  constructor(private configService: ConfigService) {
    this.initializeStorage();
  }

  private initializeStorage() {
    this.isLocal = this.configService.get('NODE_ENV') === 'development';

    if (this.isLocal) {
      // Локальная разработка - MinIO или локальное хранилище
      this.localStoragePath =
        this.configService.get('LOCAL_STORAGE_PATH') || './uploads';
      this.endpoint =
        this.configService.get('MINIO_ENDPOINT') || 'http://localhost:9000';
      this.bucketName =
        this.configService.get('MINIO_BUCKET') || 'vetguide-images';

      // Проверяем, есть ли MinIO
      if (this.configService.get('MINIO_ENDPOINT')) {
        this.initializeMinIOClient();
      } else {
        this.ensureLocalDirectory();
        this.logger.log(
          `Используется локальное хранилище: ${this.localStoragePath}`,
        );
      }
    } else {
      // Продакшн - MinIO
      this.region = this.configService.get('MINIO_REGION') || 'us-east-1';
      const bucketName = this.configService.get('MINIO_BUCKET');

      if (!bucketName) {
        throw new Error(
          'MINIO_BUCKET переменная окружения обязательна для продакшена',
        );
      }

      this.bucketName = bucketName;
      const endpoint = this.configService.get('MINIO_ENDPOINT');

      if (!endpoint) {
        throw new Error(
          'MINIO_ENDPOINT переменная окружения обязательна для продакшена',
        );
      }

      this.endpoint = endpoint;

      const accessKey = this.configService.get('MINIO_ACCESS_KEY');
      const secretKey = this.configService.get('MINIO_SECRET_KEY');

      if (!accessKey || !secretKey) {
        throw new Error(
          'MINIO_ACCESS_KEY и MINIO_SECRET_KEY переменные окружения обязательны для продакшена',
        );
      }

      // Убеждаемся, что переменные определены после проверки
      const accessKeyFinal = accessKey as string;
      const secretKeyFinal = secretKey as string;

      this.initializeMinIOClient(accessKeyFinal, secretKeyFinal);
      this.logger.log(
        `MinIO клиент инициализирован для бакета: ${this.bucketName} на ${this.endpoint}`,
      );
    }
  }

  private initializeMinIOClient(accessKey?: string, secretKey?: string) {
    const finalAccessKey =
      accessKey || this.configService.get('MINIO_ACCESS_KEY');
    const finalSecretKey =
      secretKey || this.configService.get('MINIO_SECRET_KEY');

    if (!finalAccessKey || !finalSecretKey) {
      throw new Error(
        'MINIO_ACCESS_KEY и MINIO_SECRET_KEY переменные окружения обязательны для продакшена',
      );
    }

    this.s3Client = new S3Client({
      region: this.region || 'us-east-1', // MinIO требует регион
      credentials: {
        accessKeyId: finalAccessKey,
        secretAccessKey: finalSecretKey,
      },
      endpoint: this.endpoint,
      forcePathStyle: true, // Важно для MinIO
    });

    this.logger.log(
      `MinIO клиент инициализирован для бакета: ${this.bucketName} на ${this.endpoint}`,
    );
  }

  private ensureLocalDirectory() {
    if (!fs.existsSync(this.localStoragePath)) {
      fs.mkdirSync(this.localStoragePath, { recursive: true });
    }
    if (!fs.existsSync(path.join(this.localStoragePath, 'thumbnails'))) {
      fs.mkdirSync(path.join(this.localStoragePath, 'thumbnails'), {
        recursive: true,
      });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'general',
    options: ImageProcessingOptions = {},
  ): Promise<ImageUploadResult> {
    try {
      // Валидация типа файла
      if (!this.isValidImageType(file.mimetype)) {
        throw new BadRequestException(
          'Неверный тип изображения. Разрешены только JPEG и PNG.',
        );
      }

      // Обработка изображения
      const processedImage = await this.processImage(file.buffer, options);

      // Генерация уникального ключа
      const fileExtension =
        options.format || this.getFileExtension(file.mimetype);
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      let url: string;
      let thumbnailUrl: string | undefined;

      if (this.isLocal && !this.configService.get('MINIO_ENDPOINT')) {
        // Сохранение в локальное хранилище
        const filePath = path.join(this.localStoragePath, key);
        const dirPath = path.dirname(filePath);

        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(filePath, processedImage);
        url = `/uploads/${key}`;

        // Создание миниатюры если запрошено
        if (options.createThumbnail && options.thumbnailSize) {
          const thumbnail = await this.createThumbnail(
            file.buffer,
            options.thumbnailSize,
          );
          const thumbnailKey = `${folder}/thumbnails/${fileName}`;
          const thumbnailPath = path.join(this.localStoragePath, thumbnailKey);

          if (!fs.existsSync(path.dirname(thumbnailPath))) {
            fs.mkdirSync(path.dirname(thumbnailPath), { recursive: true });
          }

          fs.writeFileSync(thumbnailPath, thumbnail);
          thumbnailUrl = `/uploads/${thumbnailKey}`;
        }
      } else {
        // Загрузка в S3/MinIO
        const uploadCommand = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: processedImage,
          ContentType: `image/${fileExtension}`,
          // Убираем ACL для MinIO, используем bucket policy
        });

        await this.s3Client.send(uploadCommand);

        if (this.isLocal && this.configService.get('MINIO_ENDPOINT')) {
          // MinIO - публичные ссылки
          url = `${this.endpoint}/${this.bucketName}/${key}`;
        } else if (this.configService.get('MINIO_ENDPOINT')) {
          // MinIO в production - публичные ссылки
          url = `${this.endpoint}/${this.bucketName}/${key}`;
        } else {
          // AWS S3
          url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
        }

        // Создание миниатюры если запрошено
        if (options.createThumbnail && options.thumbnailSize) {
          const thumbnail = await this.createThumbnail(
            file.buffer,
            options.thumbnailSize,
          );
          const thumbnailKey = `${folder}/thumbnails/${fileName}`;

          const thumbnailUploadCommand = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: thumbnailKey,
            Body: thumbnail,
            ContentType: `image/${fileExtension}`,
            // Убираем ACL для MinIO, используем bucket policy
          });

          await this.s3Client.send(thumbnailUploadCommand);

          if (this.isLocal && this.configService.get('MINIO_ENDPOINT')) {
            // MinIO - публичные ссылки для миниатюр
            thumbnailUrl = `${this.endpoint}/${this.bucketName}/${thumbnailKey}`;
          } else if (this.configService.get('MINIO_ENDPOINT')) {
            // MinIO в production - публичные ссылки для миниатюр
            thumbnailUrl = `${this.endpoint}/${this.bucketName}/${thumbnailKey}`;
          } else {
            thumbnailUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${thumbnailKey}`;
          }
        }
      }

      return {
        key,
        url,
        thumbnailUrl,
        size: processedImage.length,
        mimeType: `image/${fileExtension}`,
      };
    } catch (error) {
      this.logger.error(`Ошибка загрузки изображения: ${error.message}`);
      throw error;
    }
  }

  async deleteImage(key: string): Promise<void> {
    try {
      if (this.isLocal && !this.configService.get('MINIO_ENDPOINT')) {
        const filePath = path.join(this.localStoragePath, key);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        // Также удаляем миниатюру если она существует
        const thumbnailKey = key.replace('/thumbnails/', '/thumbnails/');
        const thumbnailPath = path.join(this.localStoragePath, thumbnailKey);
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      } else {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });
        await this.s3Client.send(deleteCommand);
      }
    } catch (error) {
      this.logger.error(`Ошибка удаления изображения: ${error.message}`);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.isLocal && !this.configService.get('MINIO_ENDPOINT')) {
      return `/uploads/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  private async processImage(
    buffer: Buffer,
    options: ImageProcessingOptions,
  ): Promise<Buffer> {
    let sharpInstance = sharp(buffer);

    // Изменение размера если указаны размеры
    if (options.maxWidth || options.maxHeight) {
      sharpInstance = sharpInstance.resize(
        options.maxWidth,
        options.maxHeight,
        {
          fit: 'inside',
          withoutEnlargement: true,
        },
      );
    }

    // Конвертация формата и установка качества
    if (options.format === 'jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality: options.quality || 80 });
    } else if (options.format === 'png') {
      sharpInstance = sharpInstance.png({ quality: options.quality || 80 });
    } else if (options.format === 'webp') {
      sharpInstance = sharpInstance.webp({ quality: options.quality || 80 });
    }

    return sharpInstance.toBuffer();
  }

  private async createThumbnail(buffer: Buffer, size: number): Promise<Buffer> {
    return sharp(buffer)
      .resize(size, size, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toBuffer();
  }

  private isValidImageType(mimetype: string): boolean {
    return ['image/jpeg', 'image/jpg', 'image/png'].includes(mimetype);
  }

  private getFileExtension(mimetype: string): string {
    if (mimetype.includes('jpeg') || mimetype.includes('jpg')) {
      return 'jpeg';
    }
    if (mimetype.includes('png')) {
      return 'png';
    }
    return 'jpeg'; // по умолчанию
  }

  // Метод для получения статистики хранилища
  getStorageStats(): Promise<{ totalFiles: number; totalSize: number }> {
    if (this.isLocal && !this.configService.get('MINIO_ENDPOINT')) {
      return Promise.resolve(this.getLocalStorageStats());
    } else {
      // Для S3/MinIO можно реализовать CloudWatch метрики или подобное
      return Promise.resolve({ totalFiles: 0, totalSize: 0 });
    }
  }

  private getLocalStorageStats(): { totalFiles: number; totalSize: number } {
    let totalFiles = 0;
    let totalSize = 0;

    const countFiles = (dirPath: string) => {
      if (fs.existsSync(dirPath)) {
        const items = fs.readdirSync(dirPath);
        items.forEach((item) => {
          const fullPath = path.join(dirPath, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            countFiles(fullPath);
          } else {
            totalFiles++;
            totalSize += stat.size;
          }
        });
      }
    };

    countFiles(this.localStoragePath);
    return { totalFiles, totalSize };
  }
}
