export const DOCTORS_API_ROUTES = {
  getTopDoctors: '/doctors/top',
  getDoctor: (id: string) => `/doctors/${id}`,
  // Removed getDoctorSchedule - schedule is now generated client-side from doctor appointments
} as const;
