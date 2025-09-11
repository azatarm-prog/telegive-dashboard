import { 
  CreateGiveawayRequest, 
  Giveaway, 
  FinishMessages, 
  FinishResult, 
  GiveawayHistoryResponse 
} from '../types/giveaway';
import { getServiceUrl } from './serviceConfig';
import { STORAGE_KEYS } from '../utils/constants';

export class GiveawayService {
  private static getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  static async createGiveaway(data: CreateGiveawayRequest): Promise<Giveaway> {
    let mediaUrl: string | undefined;

    // Upload media file if provided (this should go to Media Service)
    if (data.mediaFile) {
      const mediaServiceUrl = getServiceUrl('MEDIA');
      const formData = new FormData();
      formData.append('file', data.mediaFile);
      
      const uploadResponse = await fetch(`${mediaServiceUrl}/api/media/upload`, {
        method: 'POST',
        headers: {
          ...(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) && { 
            'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}` 
          })
        },
        body: formData
      });
      
      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        if (result.success) {
          mediaUrl = result.url;
        }
      }
    }

    // Create giveaway using Giveaway Service
    const giveawayServiceUrl = getServiceUrl('GIVEAWAY');
    const giveawayData = {
      title: data.title,
      main_body: data.mainBody,
      winner_count: data.winnerCount,
      media_url: mediaUrl,
    };

    const response = await fetch(`${giveawayServiceUrl}/api/giveaways/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(giveawayData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create giveaway');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to create giveaway');
    }

    return result.giveaway;
  }

  static async getActiveGiveaway(accountId: number): Promise<Giveaway | null> {
    try {
      const giveawayServiceUrl = getServiceUrl('GIVEAWAY');
      const response = await fetch(`${giveawayServiceUrl}/api/giveaways/active/${accountId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        return null; // No active giveaway
      }

      const result = await response.json();
      return result.giveaway;
    } catch (error) {
      // If no active giveaway, return null
      return null;
    }
  }

  static async updateFinishMessages(
    giveawayId: number,
    messages: FinishMessages
  ): Promise<void> {
    const giveawayServiceUrl = getServiceUrl('GIVEAWAY');
    const response = await fetch(`${giveawayServiceUrl}/api/giveaways/${giveawayId}/finish-messages`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        conclusion_message: messages.conclusionMessage,
        winner_message: messages.winnerMessage,
        loser_message: messages.loserMessage,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update finish messages');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to update finish messages');
    }
  }

  static async finishGiveaway(giveawayId: number): Promise<FinishResult> {
    const giveawayServiceUrl = getServiceUrl('GIVEAWAY');
    const response = await fetch(`${giveawayServiceUrl}/api/giveaways/${giveawayId}/finish`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to finish giveaway');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to finish giveaway');
    }

    return result;
  }

  static async getHistory(
    accountId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<GiveawayHistoryResponse> {
    const giveawayServiceUrl = getServiceUrl('GIVEAWAY');
    const response = await fetch(`${giveawayServiceUrl}/api/giveaways/history/${accountId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch giveaway history');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to fetch giveaway history');
    }

    return result;
  }

  static async getGiveawayDetails(giveawayId: number): Promise<Giveaway> {
    const giveawayServiceUrl = getServiceUrl('GIVEAWAY');
    const response = await fetch(`${giveawayServiceUrl}/api/giveaways/${giveawayId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch giveaway details');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to fetch giveaway details');
    }

    return result.giveaway;
  }
}

