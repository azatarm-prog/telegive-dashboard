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
    const url = `${giveawayServiceUrl}/api/giveaways/${giveawayId}/finish`;
    
    console.log('🔄 Making API call to finish giveaway...');
    console.log('URL:', url);
    console.log('Giveaway ID:', giveawayId);
    console.log('Headers:', this.getAuthHeaders());
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      console.log('📡 API Response Status:', response.status);
      console.log('📡 API Response OK:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ API Error Response:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        result = await response.json();
        console.log('✅ API Success Response:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse success response:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!result.success) {
        console.error('❌ API returned success=false:', result);
        throw new Error(result.message || result.error || 'Failed to finish giveaway');
      }

      console.log('✅ Giveaway finished successfully via API');
      return result;
    } catch (error: any) {
      console.error('❌ finishGiveaway API call failed:', error);
      throw error;
    }
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

  static async publishGiveaway(giveawayId: number): Promise<{ success: boolean; message?: string }> {
    const giveawayServiceUrl = getServiceUrl('GIVEAWAY');
    const url = `${giveawayServiceUrl}/api/giveaways/${giveawayId}/publish`;
    
    console.log('🔄 Making API call to publish giveaway...');
    console.log('URL:', url);
    console.log('Giveaway ID:', giveawayId);
    console.log('Headers:', this.getAuthHeaders());
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      console.log('📡 Publish API Response Status:', response.status);
      console.log('📡 Publish API Response OK:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Publish API Error Response:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse publish error response:', parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        result = await response.json();
        console.log('✅ Publish API Success Response:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse publish success response:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!result.success) {
        console.error('❌ Publish API returned success=false:', result);
        throw new Error(result.message || result.error || 'Failed to publish giveaway');
      }

      console.log('✅ Giveaway published successfully via API');
      return result;
    } catch (error: any) {
      console.error('❌ publishGiveaway API call failed:', error);
      throw error;
    }
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

