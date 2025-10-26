
export const ROLES = {
  ADMIN: 'Admin',
  EMPLOYER: 'Employer',
  JOB_SEEKER: 'JobSeeker',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
