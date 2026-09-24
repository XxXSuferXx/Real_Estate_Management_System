
export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  permissions: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: User;
}