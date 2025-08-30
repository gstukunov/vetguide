import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { ImageProcessingOptions } from './interfaces/interfaces';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../user/types/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UploadImageDto } from './dto/upload-image.dto';

@Controller('s3')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadOptions: UploadImageDto,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Файл изображения не предоставлен');
    }

    const options: ImageProcessingOptions = {
      maxWidth: uploadOptions.maxWidth,
      maxHeight: uploadOptions.maxHeight,
      quality: uploadOptions.quality,
      format: uploadOptions.format,
      createThumbnail: uploadOptions.createThumbnail,
      thumbnailSize: uploadOptions.thumbnailSize,
    };

    return this.s3Service.uploadImage(file, folder || 'general', options);
  }

  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('image'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Query('entityType') entityType: string = 'user',
    @Query('entityId') entityId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Файл изображения не предоставлен');
    }

    const folder = `avatars/${entityType}${entityId ? `/${entityId}` : ''}`;
    const options: ImageProcessingOptions = {
      maxWidth: 400,
      maxHeight: 400,
      quality: 85,
      format: 'jpeg',
      createThumbnail: true,
      thumbnailSize: 150,
    };

    return this.s3Service.uploadImage(file, folder, options);
  }

  @Post('upload/doctor-avatar')
  @UseInterceptors(FileInterceptor('image'))
  async uploadDoctorAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Query('doctorId') doctorId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Файл изображения не предоставлен');
    }

    const folder = `avatars/doctors/${doctorId}`;
    const options: ImageProcessingOptions = {
      maxWidth: 500,
      maxHeight: 500,
      quality: 90,
      format: 'jpeg',
      createThumbnail: true,
      thumbnailSize: 200,
    };

    return this.s3Service.uploadImage(file, folder, options);
  }

  @Post('upload/clinic-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadClinicImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('clinicId') clinicId: string,
    @Query('type') type: 'logo' | 'banner' | 'gallery' = 'gallery',
  ) {
    if (!file) {
      throw new BadRequestException('Файл изображения не предоставлен');
    }

    const folder = `clinics/${clinicId}/${type}`;
    const options: ImageProcessingOptions = {
      maxWidth: type === 'banner' ? 1200 : 800,
      maxHeight: type === 'banner' ? 400 : 600,
      quality: 85,
      format: 'jpeg',
      createThumbnail: type === 'gallery',
      thumbnailSize: 300,
    };

    return this.s3Service.uploadImage(file, folder, options);
  }

  @Delete(':key')
  async deleteImage(@Param('key') key: string) {
    await this.s3Service.deleteImage(key);
    return { message: 'Изображение успешно удалено' };
  }

  @Get('signed-url/:key')
  async getSignedUrl(
    @Param('key') key: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    const expiresInSeconds = expiresIn ? parseInt(expiresIn, 10) : 3600;
    return {
      url: await this.s3Service.getSignedUrl(key, expiresInSeconds),
      expiresIn: expiresInSeconds,
    };
  }

  @Get('stats')
  async getStorageStats() {
    return this.s3Service.getStorageStats();
  }

  @Get('health')
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      storage: this.s3Service['isLocal'] ? 'local' : 's3',
    };
  }
}
