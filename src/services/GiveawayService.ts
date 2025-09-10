import apiClient from './api';
import { 
  CreateGiveawayRequest, 
  Giveaway, 
  FinishMessages, 
  FinishResult, 
  GiveawayHistoryResponse 
} from '../types/giveaway';

export class GiveawayService {
  static async createGiveaway(data: CreateGiveawayRequest): Promise<Giveaway> {
    let mediaUrl: string | undefined;

    // Upload media file if provided
    if (data.mediaFile) {
      const uploadResponse = await apiClient.uploadFile<{ success: boolean; url: string }>(
        '/api/media/upload',
        data.mediaFile
      );
      if (uploadResponse.success) {
        mediaUrl = uploadResponse.url;
      }
    }

    // Create giveaway
    const giveawayData = {
      title: data.title,
      main_body: data.mainBody,
      winner_count: data.winnerCount,
      media_url: mediaUrl,
    };

    const response = await apiClient.post<{ success: boolean; giveaway: Giveaway }>(
      '/api/giveaways/create',
      giveawayData
    );

    if (!response.success) {
      throw new Error('Failed to create giveaway');
    }

    return response.giveaway;
  }

  static async getActiveGiveaway(accountId: number): Promise<Giveaway | null> {
    try {
      const response = await apiClient.get<{ success: boolean; giveaway: Giveaway | null }>(
        `/api/giveaways/active/${accountId}`
      );
      return response.giveaway;
    } catch (error) {
      // If no active giveaway, return null
      return null;
    }
  }

  static async updateFinishMessages(
    giveawayId: number,
    messages: FinishMessages
  ): Promise<void> {
    const response = await apiClient.put<{ success: boolean }>(
      `/api/giveaways/${giveawayId}/finish-messages`,
      {
        conclusion_message: messages.conclusionMessage,
        winner_message: messages.winnerMessage,
        loser_message: messages.loserMessage,
      }
    );

    if (!response.success) {
      throw new Error('Failed to update finish messages');
    }
  }

  static async finishGiveaway(giveawayId: number): Promise<FinishResult> {
    const response = await apiClient.post<FinishResult>(
      `/api/giveaways/${giveawayId}/finish`
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to finish giveaway');
    }

    return response;
  }

  static async getHistory(
    accountId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<GiveawayHistoryResponse> {
    const response = await apiClient.get<GiveawayHistoryResponse>(
      `/api/giveaways/history/${accountId}?page=${page}&limit=${limit}`
    );

    if (!response.success) {
      throw new Error('Failed to fetch giveaway history');
    }

    return response;
  }

  static async getGiveawayDetails(giveawayId: number): Promise<Giveaway> {
    const response = await apiClient.get<{ success: boolean; giveaway: Giveaway }>(
      `/api/giveaways/${giveawayId}`
    );

    if (!response.success) {
      throw new Error('Failed to fetch giveaway details');
    }

    return response.giveaway;
  }
}

