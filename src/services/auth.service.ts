import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { 
  AuthTokens, 
  LoginCredentials, 
  SignupCredentials, 
  AuthResponse, 
  DecodedToken,
  User 
} from '../types/auth.types';

const API_BASE_URL = process.env.REACT_APP_AGENT_BACKEND_URL || 'https://agentbackend-2932.onrender.com';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REMEMBER_ME_KEY = 'remember_me';

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokens();
  }

  private loadTokens(): void {
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    
    if (rememberMe) {
      this.accessToken = Cookies.get(ACCESS_TOKEN_KEY) || null;
      this.refreshToken = Cookies.get(REFRESH_TOKEN_KEY) || null;
    } else {
      this.accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      this.refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    }
  }

  private saveTokens(tokens: AuthTokens, rememberMe: boolean = false): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;

    if (rememberMe) {
      // Store in cookies for persistence
      Cookies.set(ACCESS_TOKEN_KEY, tokens.accessToken, { expires: 7, secure: true, sameSite: 'strict' });
      Cookies.set(REFRESH_TOKEN_KEY, tokens.refreshToken, { expires: 30, secure: true, sameSite: 'strict' });
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      // Store in session storage
      sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, {
        email: credentials.email,
        password: credentials.password,
      });

      const { tokens, user } = response.data;
      this.saveTokens(tokens, credentials.rememberMe);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/signup`, credentials);
      const { tokens } = response.data;
      this.saveTokens(tokens);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Signup failed');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if needed
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
    } catch (error) {
      // Continue with local logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<AuthTokens>(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken: this.refreshToken,
      });

      const tokens = response.data;
      const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
      this.saveTokens(tokens, rememberMe);

      return tokens;
    } catch (error) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }
  }

  async getCurrentUser(): Promise<User> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await axios.get<User>(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Try to refresh token
        await this.refreshAccessToken();
        // Retry the request
        const response = await axios.get<User>(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        });
        return response.data;
      }
      throw error;
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await axios.patch<User>(`${API_BASE_URL}/api/auth/profile`, updates, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    return response.data;
  }

  // OAuth preparation methods
  getGoogleAuthUrl(): string {
    return `${API_BASE_URL}/api/auth/google`;
  }

  getGithubAuthUrl(): string {
    return `${API_BASE_URL}/api/auth/github`;
  }

  async handleOAuthCallback(provider: string, code: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/${provider}/callback`, {
      code,
    });

    const { tokens } = response.data;
    this.saveTokens(tokens);

    return response.data;
  }
}

export default new AuthService();