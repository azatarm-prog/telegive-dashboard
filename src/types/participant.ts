export interface Participant {
  id: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name?: string;
  captcha_completed: boolean;
  participated_at: string;
  is_winner?: boolean;
}

export interface ParticipantStats {
  total: number;
  captcha_completed: number;
  captcha_pending: number;
  winners?: number;
}

export interface ParticipantListResponse {
  success: boolean;
  participants: Participant[];
  stats: ParticipantStats;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ParticipantState {
  participants: Record<number, Participant[]>; // giveawayId -> participants
  stats: Record<number, ParticipantStats>; // giveawayId -> stats
  loading: Record<number, boolean>; // giveawayId -> loading
  error: Record<number, string | null>; // giveawayId -> error
}

