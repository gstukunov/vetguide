import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { SearchType } from '../search.service';

export class SearchDto {
  @ApiProperty({
    description: 'Поисковый запрос',
    example: 'кардиолог',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  query: string;

  @ApiProperty({
    description: 'Тип поиска',
    enum: SearchType,
    default: SearchType.ALL,
    required: false,
  })
  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;
}
