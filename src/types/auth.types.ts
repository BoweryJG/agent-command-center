export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface DecodedToken {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
  updatePassword?: (newPassword: string) => Promise<void>;
}