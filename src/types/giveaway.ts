export interface CreateGiveawayRequest {
  title: string;
  mainBody: string;
  winnerCount: number;
  mediaFile?: File;
}

export interface Giveaway {
  id: number;
  title: string;
  main_body: string;
  winner_count: number;
  status: 'active' | 'finished';
  participant_count: number;
  messages_ready_for_finish: boolean;
  created_at: string;
  finished_at?: string;
  media_url?: string;
  media_type?: string;
  conclusion_message?: string;
  winner_message?: string;
  loser_message?: string;
}

export interface FinishMessages {
  conclusionMessage: string;
  winnerMessage: string;
  loserMessage: string;
}

export interface FinishResult {
  success: boolean;
  message: string;
  winners?: Winner[];
}

export interface Winner {
  id: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name?: string;
}

export interface GiveawayHistoryResponse {
  success: boolean;
  giveaways: Giveaway[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GiveawayState {
  activeGiveaway: Giveaway | null;
  history: Giveaway[];
  loading: boolean;
  error: string | null;
  historyLoading: boolean;
  historyError: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

