
export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "agent" | "admin"
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: User;
}