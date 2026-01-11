export const APPOINTMENTS_API_ROUTES = {
  create: '/appointments',
  cancel: (id: string) => `/appointments/${id}`,
  // Removed getMyAppointments - appointments are now received from doctor endpoint
} as const;
