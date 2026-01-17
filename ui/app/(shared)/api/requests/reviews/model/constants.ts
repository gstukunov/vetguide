export const REVIEWS_API_ROUTES = {
  create: '/reviews',
  getByDoctor: (doctorId: string) => `/reviews/doctor/${doctorId}`,
  getAll: '/reviews',
} as const;
