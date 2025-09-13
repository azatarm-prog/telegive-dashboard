export interface LoginRequest {
  botToken: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  account: Account;
  message?: string;
}

export interface Account {
  id: number;
  bot_id: number; // Telegram bot ID for Channel Service integration (required)
  username: string;
  first_name: string;
  last_name?: string;
  is_bot: boolean;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  account: Account | null;
  loading: boolean;
  error: string | null;
}

