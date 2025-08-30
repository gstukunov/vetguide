import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadImageDto {
  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(4000)
  maxWidth?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(4000)
  maxHeight?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  quality?: number;

  @IsOptional()
  @IsEnum(['jpeg', 'png', 'webp'])
  format?: 'jpeg' | 'png' | 'webp';

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  createThumbnail?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(50)
  @Max(500)
  thumbnailSize?: number;
}

export class UploadAvatarDto extends UploadImageDto {
  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;
}

export class UploadDoctorAvatarDto extends UploadImageDto {
  @IsString()
  doctorId: string;
}

export class UploadClinicImageDto extends UploadImageDto {
  @IsString()
  clinicId: string;

  @IsEnum(['logo', 'banner', 'gallery'])
  type: 'logo' | 'banner' | 'gallery';
}
