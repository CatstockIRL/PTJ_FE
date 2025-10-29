export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  verified: boolean;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: User;
}