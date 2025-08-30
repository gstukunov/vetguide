import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateVetClinicDto {
  @ApiProperty({
    description: 'Адрес клиники',
    example: 'ул. Тверская, д. 1, Москва',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'ИНН клиники',
    example: '7701234567',
  })
  @IsString()
  @IsNotEmpty()
  inn: string;

  @ApiProperty({
    description: 'Название клиники',
    example: 'Ветеринарная клиника "Добрый доктор"',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Описание клиники',
    example: 'Современная ветеринарная клиника с полным спектром услуг',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
