import axios from 'axios';
import { LoginRequest, LoginResponse, Account } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';

const AUTH_SERVICE_URL = import.meta.env.VITE_TELEGIVE_AUTH_URL || 'https://web-production-ddd7e.up.railway.app';

export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      // First try to login with existing bot
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
        bot_token: data.botToken
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      // Check if the response has the expected format
      if (loginResponse.data && loginResponse.data.success && loginResponse.data.token) {
        // Store auth data
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, loginResponse.data.token);
        localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(loginResponse.data.account));
        return loginResponse.data;
      }
      
      throw new Error(loginResponse.data?.message || 'Login failed');
    } catch (error: any) {
      // If login fails with 401 (invalid credentials), try to register the bot (signup)
      if (error.response?.status === 401 && error.response?.data?.error_code === 'INVALID_CREDENTIALS') {
        try {
          const signupResponse = await axios.post(`${AUTH_SERVICE_URL}/api/auth/signup`, {
            bot_token: data.botToken
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          });
          
          if (signupResponse.data && signupResponse.data.success && signupResponse.data.token) {
            // Store auth data
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, signupResponse.data.token);
            localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(signupResponse.data.account));
            return signupResponse.data;
          }
          
          throw new Error(signupResponse.data?.message || 'Registration failed');
        } catch (signupError: any) {
          // If signup also fails, provide a clear error message
          if (signupError.response?.data?.error) {
            throw new Error(signupError.response.data.error);
          }
          throw new Error('Unable to authenticate or register bot. Please check your bot token.');
        }
      }
      
      // For other errors, provide specific error messages
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timeout. Please try again.');
      }
      
      if (error.message?.includes('Network Error')) {
        throw new Error('Unable to connect to authentication service. Please check your internet connection.');
      }
      
      throw new Error(error.message || 'Authentication failed');
    }
  }

  static async validateToken(): Promise<{ valid: boolean; account?: Account }> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        return { valid: false };
      }
      
      const response = await axios.get<{ success: boolean; account: Account }>(`${AUTH_SERVICE_URL}/api/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      return { valid: response.data.success, account: response.data.account };
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

