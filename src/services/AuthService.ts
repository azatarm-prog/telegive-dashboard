import axios from 'axios';
import { LoginRequest, LoginResponse, Account } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';

const AUTH_SERVICE_URL = import.meta.env.VITE_TELEGIVE_AUTH_URL || 'https://web-production-ddd7e.up.railway.app';

export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      // Use the correct endpoint: /api/v1/bots/register (handles both login and signup)
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/v1/bots/register`, {
        bot_token: data.botToken
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      // Handle the actual response format from auth service
      if (response.status === 200 && response.data) {
        const { bot_id, access_token, message } = response.data;
        
        // Create account object from the response
        const account: Account = {
          id: parseInt(bot_id),
          bot_id: parseInt(bot_id), // Set bot_id for Channel Service integration
          username: `bot_${bot_id}`,
          first_name: 'Telegram Bot',
          last_name: '',
          is_bot: true,
          can_join_groups: true,
          can_read_all_group_messages: true,
          supports_inline_queries: false,
        };
        
        // Store auth data
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token);
        localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(account));
        
        // Return in the format expected by the frontend
        return {
          success: true,
          token: access_token,
          account: account,
          message: message
        };
      }
      
      throw new Error('Invalid response format from auth service');
    } catch (error: any) {
      // Handle specific error cases based on auth service documentation
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || 'Authentication failed';
        throw new Error(errorMessage);
      }
      
      if (error.response?.status === 500) {
        throw new Error('Authentication service is temporarily unavailable. Please try again later.');
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timeout. Please try again.');
      }
      
      if (error.message?.includes('Network Error')) {
        throw new Error('Unable to connect to authentication service. Please check your internet connection.');
      }
      
      throw new Error(error.response?.data?.error || error.message || 'Authentication failed');
    }
  }

  static async validateToken(): Promise<{ valid: boolean; account?: Account }> {
    try {
      const token = this.getStoredToken();
      const account = this.getStoredAccount();
      
      if (!token || !account) {
        return { valid: false };
      }
      
      // For now, we'll consider stored tokens as valid since the auth service
      // doesn't have a separate validation endpoint. In a production environment,
      // you might want to add a validation endpoint to the auth service.
      return { valid: true, account: account };
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

