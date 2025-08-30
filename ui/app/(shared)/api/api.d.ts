/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** День недели */
export enum WeekDay {
  ValueПонедельник = "Понедельник",
  ValueВторник = "Вторник",
  ValueСреда = "Среда",
  ValueЧетверг = "Четверг",
  ValueПятница = "Пятница",
  ValueСуббота = "Суббота",
  ValueВоскресенье = "Воскресенье",
}

export interface UpdateUserRoleDto {
  /**
   * ID пользователя, для которого меняется роль
   * @example 1
   */
  userId: number;
  /**
   * Новая роль пользователя
   * @example "VET_CLINIC"
   */
  newRole: "USER" | "VET_CLINIC" | "SUPER_ADMIN";
}

export interface User {
  /**
   * Уникальный идентификатор пользователя
   * @example 1
   */
  id: number;
  /**
   * Номер телефона пользователя
   * @example "+79001234567"
   */
  phone: string;
  /**
   * Хешированный пароль пользователя
   * @example "hashed_password_string"
   */
  password: string;
  /**
   * Полное имя пользователя
   * @example "Иванов Иван Иванович"
   */
  fullName: string;
  /**
   * Статус верификации пользователя
   * @example false
   */
  isVerified: boolean;
  /**
   * Роль пользователя в системе
   * @example "USER"
   */
  role: "USER" | "VET_CLINIC" | "SUPER_ADMIN";
  /** Список отзывов пользователя */
  reviews?: Review[];
  /** Связанная ветеринарная клиника */
  clinic?: VetClinic;
  /**
   * Дата создания пользователя
   * @format date-time
   * @example "2024-01-01T00:00:00.000Z"
   */
  createdAt: string;
  /**
   * Дата последнего обновления пользователя
   * @format date-time
   * @example "2024-01-01T00:00:00.000Z"
   */
  updatedAt: string;
}

export interface VetClinic {
  /**
   * Уникальный идентификатор клиники
   * @example 1
   */
  id: number;
  /**
   * Адрес клиники
   * @example "ул. Тверская, д. 1, Москва"
   */
  address: string;
  /**
   * ИНН клиники
   * @example "7701234567"
   */
  inn: string;
  /**
   * Название клиники
   * @example "Ветеринарная клиника "Добрый доктор""
   */
  name: string;
  /**
   * Описание клиники
   * @example "Современная ветеринарная клиника с полным спектром услуг"
   */
  description: string;
  /** Список врачей в клинике */
  doctors?: Doctor[];
  /** Список пользователей клиники */
  users?: User[];
}

export interface DoctorSchedule {
  /**
   * Уникальный идентификатор записи
   * @example 1
   */
  id: number;
  /**
   * День недели
   * @example "Понедельник"
   */
  dayOfWeek: WeekDay;
  /**
   * Доступен ли врач в этот день
   * @default true
   * @example true
   */
  isAvailable: boolean;
  /** Связанный врач */
  doctor: Doctor;
}

export interface Doctor {
  /**
   * Уникальный идентификатор врача
   * @example 1
   */
  id: number;
  /**
   * Полное имя врача
   * @example "Иванов Иван Иванович"
   */
  fullName: string;
  /**
   * Описание врача
   * @example "Опытный ветеринар с 10-летним стажем"
   */
  description?: string;
  /**
   * Список специалитетов врача
   * @example ["Терапевт","Хирург","Дерматолог"]
   */
  specialization?: string[];
  /** Ветклиника, в которой работает врач */
  clinic: VetClinic;
  /** Список отзывов о враче */
  reviews?: Review[];
  /** Расписание работы врача */
  schedules?: DoctorSchedule[];
  /**
   * Средний рейтинг врача (вычисляемое поле)
   * @example 4.5
   */
  averageRating?: number;
}

export interface Review {
  /**
   * Уникальный идентификатор отзыва
   * @example 1
   */
  id: number;
  /**
   * Заголовок отзыва
   * @example "Отличный врач!"
   */
  title: string;
  /**
   * Текст отзыва
   * @example "Очень внимательный и профессиональный врач. Рекомендую!"
   */
  description: string;
  /**
   * Рейтинг отзыва (1-5)
   * @min 1
   * @max 5
   * @example 5
   */
  rating: number;
  /**
   * Статус отзыва
   * @example "VERIFIED"
   */
  status: "PENDING" | "VERIFIED";
  /** Врач, к которому относится отзыв */
  doctor: Doctor;
  /** Пользователь, оставивший отзыв */
  user: User;
}

export interface SafeUserDto {
  id: number;
  /** @example "+79123456789" */
  phone: string;
  /** @example "Иван Иванов" */
  fullName: string;
  /** @example "USER" */
  role: "USER" | "VET_CLINIC" | "SUPER_ADMIN";
  /** @default false */
  isVerified: boolean;
  reviews?: Review[];
  clinic?: VetClinic;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface CreateUserDto {
  /** @example "+79123456789" */
  phone: string;
  /** @example "Иванов Иван Иванович" */
  fullName: string;
  /**
   * @minLength 8
   * @example "pasSwor!d1"
   */
  password: string;
  /**
   * Должен совпадать с паролем
   * @example "pasSwor!d1"
   */
  confirmPassword: string;
}

export interface RequestPhoneChangeDto {
  /** @example "+79123456789" */
  phone: string;
}

export interface VerifyCodeDto {
  /** @example "+79123456789" */
  phone: string;
  /**
   * @minLength 6
   * @maxLength 6
   */
  code: string;
}

export interface PasswordRecoveryRequestDto {
  /** @example "+79123456789" */
  phone: string;
}

export interface PasswordResetDto {
  /** @example "+79123456789" */
  phone: string;
  /**
   * @minLength 8
   * @example "newPassw0rd!"
   */
  password: string;
  /**
   * @minLength 8
   * @example "newPassw0rd!"
   */
  passwordConfirmation: string;
}

export interface CreateReviewDto {
  title: string;
  description: string;
  rating: number;
  doctorId: number;
}

export interface UpdateReviewStatusDto {
  /**
   * Обновление статуса определенного отзыва
   * @example "PENDING | VERIFIED"
   */
  status: string;
}

export interface CreateDoctorDto {
  /** Полное имя врача */
  fullName: string;
  /** Описание врача */
  description?: string;
  /**
   * Список специалитетов врача
   * @example ["Терапевт","Хирург","Дерматолог"]
   */
  specialization?: string[];
  /** ID ветклиники */
  clinicId: number;
}

export interface UpdateDoctorDto {
  /** Full name of the doctor */
  fullName?: string;
  /** Doctor description */
  description?: string;
  /**
   * Array of doctor specializations
   * @example ["Cardiology","Surgery","Dermatology"]
   */
  specialization?: string[];
  /** ID of the veterinary clinic */
  clinicId?: number;
}

export interface CreateVetClinicDto {
  /**
   * Адрес клиники
   * @example "ул. Тверская, д. 1, Москва"
   */
  address: string;
  /**
   * ИНН клиники
   * @example "7701234567"
   */
  inn: string;
  /**
   * Название клиники
   * @example "Ветеринарная клиника "Добрый доктор""
   */
  name: string;
  /**
   * Описание клиники
   * @example "Современная ветеринарная клиника с полным спектром услуг"
   */
  description: string;
}

export interface LoginDto {
  /** @example "+79123456789" */
  phone: string;
  password: string;
}

export interface AccessDto {
  /** @example "AEfdeacd3qd213341wqdeadca..." */
  accessToken: string;
  refreshToken: string;
}

export interface RefreshDto {
  /** Refresh token */
  refreshToken: string;
}

export interface CreateDoctorScheduleDto {
  /**
   * День недели
   * @example "Понедельник"
   */
  dayOfWeek: WeekDay;
  /**
   * Доступен ли врач в этот день
   * @example true
   */
  isAvailable: boolean;
}

export interface UpdateDoctorScheduleDto {
  /**
   * Статус доступности врача
   * @example false
   */
  isAvailable: boolean;
}

export type UploadImageDto = object;
