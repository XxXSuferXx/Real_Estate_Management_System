export enum UserRole {
  AGENT = 'agent',
  BUYER = 'buyer',
}

export enum AdminRole {
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
  MODERATOR = "moderator"
}

export type Role = UserRole | AdminRole;