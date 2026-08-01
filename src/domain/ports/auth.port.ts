import type { User } from '../entities';

export interface AuthPort {
  login(): Promise<User>;
  logout(): Promise<void>;
  getToken(): Promise<string | null>;
  isAuthenticated(): Promise<boolean>;
  getCurrentUser(): Promise<User | null>;
}
