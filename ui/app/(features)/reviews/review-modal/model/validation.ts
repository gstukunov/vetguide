import { z } from 'zod';

export const reviewFormSchema = z.object({
  story: z.string().optional(),
  liked: z.string().optional(),
  disliked: z.string().optional(),
  rating: z
    .number()
    .min(1, 'Пожалуйста, выберите рейтинг')
    .max(5, 'Рейтинг не может быть больше 5'),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;
