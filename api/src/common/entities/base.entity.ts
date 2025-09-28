import { PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

// Используем динамический импорт для nanoid чтобы избежать проблем с Jest
const generateId = () => {
  if (typeof window === 'undefined') {
    // Node.js environment
    const { nanoid } = require('nanoid');
    return nanoid();
  } else {
    // Browser environment
    return 'mock-id-for-testing';
  }
};

export abstract class BaseEntity {
  @ApiProperty({
    description: 'Уникальный идентификатор',
    example: 'V1StGXR8_Z5jdHi6B-myT',
  })
  @PrimaryColumn({
    type: 'varchar',
    length: 21,
    default: () => `'${generateId()}'`,
  })
  id: string;

  @ApiProperty({
    description: 'Дата создания',
    example: '2023-12-01T10:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Дата последнего обновления',
    example: '2023-12-01T10:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  constructor() {
    if (!this.id) {
      this.id = generateId();
    }
  }
}
