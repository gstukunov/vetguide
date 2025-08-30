import { z } from 'zod';

export const createUserSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Имя обязательно')
      .max(50, 'Слишком длинное имя'),
    phone: z
      .string()
      .regex(
        /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/,
        'Введите корректный номер телефона'
      ),
    password: z
      .string()
      .regex(
        /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W])(?=.*[!@#$%^&*()+=;:’.,”<>\/\?|\{\}\[\]\? ;]).{8,70})/,
        'Пароль не соответсвует требованиям'
      )
      .min(8, 'Пароль должен быть не менее 8 символов'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });
