import apiClient from './api';
import { LoginRequest, LoginResponse, Account } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';

export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', data);
    
    if (response.success && response.token) {
      // Store auth data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(response.account));
    }
    
    return response;
  }

  static async validateToken(): Promise<{ valid: boolean; account?: Account }> {
    try {
      const response = await apiClient.get<{ success: boolean; account: Account }>('/api/auth/validate');
      return { valid: response.success, account: response.account };
    } catch (error) {
      return { valid: false };
    }
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_ACCOUNT);
  }

  static getStoredToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  static getStoredAccount(): Account | null {
    const accountData = localStorage.getItem(STORAGE_KEYS.USER_ACCOUNT);
    return accountData ? JSON.parse(accountData) : null;
  }

  static isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

