export const Role = {
  AGENT: 'agent',
  BUYER: 'buyer',
  ADMIN: 'admin',
} as const;

export type Role = (typeof Role)[keyof typeof Role];