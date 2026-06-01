export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}
