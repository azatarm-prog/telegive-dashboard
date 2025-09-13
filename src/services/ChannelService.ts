import { getServiceUrl } from './serviceConfig';
import { STORAGE_KEYS } from '../utils/constants';

export interface ChannelConfig {
  username: string;
  title: string;
  memberCount?: number;
  isVerified: boolean;
  botHasAdminRights: boolean;
  lastVerified?: string;
}

export interface ChannelVerificationResult {
  success: boolean;
  channelExists: boolean;
  botIsAdmin: boolean;
  botCanPostMessages: boolean;
  memberCount?: number;
  channelTitle?: string;
  channelDescription?: string;
  error?: string;
}

export class ChannelService {
  private static getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Verify if the bot has admin rights in the specified channel
   */
  static async verifyChannelAccess(channelUsername: string, botId: number): Promise<ChannelVerificationResult> {
    const channelServiceUrl = getServiceUrl('CHANNEL');
    const url = `${channelServiceUrl}/api/channels/verify`;
    
    console.log('🔍 Verifying channel access...');
    console.log('Channel:', channelUsername);
    console.log('Bot ID:', botId);
    console.log('URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          channel_username: channelUsername,
          account_id: botId // Using bot_id as account_id for Channel Service
        })
      });

      console.log('📡 Channel verification response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Channel verification error response:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        return {
          success: false,
          channelExists: false,
          botIsAdmin: false,
          botCanPostMessages: false,
          error: errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      let result;
      try {
        result = await response.json();
        console.log('✅ Channel verification success response:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse success response:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!result.success) {
        console.error('❌ Channel verification returned success=false:', result);
        return {
          success: false,
          channelExists: result.channel_exists || false,
          botIsAdmin: result.bot_is_admin || false,
          botCanPostMessages: result.bot_can_post_messages || false,
          error: result.message || result.error || 'Channel verification failed'
        };
      }

      console.log('✅ Channel verification successful');
      return {
        success: true,
        channelExists: result.channel_exists || true,
        botIsAdmin: result.bot_is_admin || false,
        botCanPostMessages: result.bot_can_post_messages || false,
        memberCount: result.member_count,
        channelTitle: result.channel_title,
        channelDescription: result.channel_description,
      };
    } catch (error: any) {
      console.error('❌ Channel verification API call failed:', error);
      return {
        success: false,
        channelExists: false,
        botIsAdmin: false,
        botCanPostMessages: false,
        error: error.message || 'Network error during channel verification'
      };
    }
  }

  /**
   * Save channel configuration for the current account
   */
  static async saveChannelConfig(botId: number, config: ChannelConfig): Promise<void> {
    const channelServiceUrl = getServiceUrl('CHANNEL');
    const url = `${channelServiceUrl}/api/accounts/${botId}/channel`;
    
    console.log('💾 Saving channel configuration...');
    console.log('Bot ID:', botId);
    console.log('Config:', config);
    console.log('URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          channel_username: config.username,
          channel_title: config.title,
          member_count: config.memberCount,
          is_verified: config.isVerified,
          bot_has_admin_rights: config.botHasAdminRights,
          last_verified: config.lastVerified,
        })
      });

      console.log('📡 Save channel config response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Save channel config error response:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        result = await response.json();
        console.log('✅ Save channel config success response:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse success response:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!result.success) {
        console.error('❌ Save channel config returned success=false:', result);
        throw new Error(result.message || result.error || 'Failed to save channel configuration');
      }

      console.log('✅ Channel configuration saved successfully');
    } catch (error: any) {
      console.error('❌ Save channel config API call failed:', error);
      throw error;
    }
  }

  /**
   * Get channel configuration for the current account
   */
  static async getChannelConfig(botId: number): Promise<ChannelConfig | null> {
    const channelServiceUrl = getServiceUrl('CHANNEL');
    const url = `${channelServiceUrl}/api/accounts/${botId}/channel`;
    
    console.log('📥 Getting channel configuration...');
    console.log('Bot ID:', botId);
    console.log('URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      console.log('📡 Get channel config response status:', response.status);

      if (response.status === 404) {
        console.log('ℹ️ No channel configuration found');
        return null;
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Get channel config error response:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        result = await response.json();
        console.log('✅ Get channel config success response:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse success response:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!result.success) {
        console.error('❌ Get channel config returned success=false:', result);
        throw new Error(result.message || result.error || 'Failed to get channel configuration');
      }

      const config: ChannelConfig = {
        username: result.channel.channel_username,
        title: result.channel.channel_title,
        memberCount: result.channel.member_count,
        isVerified: result.channel.is_verified,
        botHasAdminRights: result.channel.bot_has_admin_rights,
        lastVerified: result.channel.last_verified,
      };

      console.log('✅ Channel configuration retrieved successfully');
      return config;
    } catch (error: any) {
      console.error('❌ Get channel config API call failed:', error);
      throw error;
    }
  }

  /**
   * Delete channel configuration for the current account
   */
  static async deleteChannelConfig(botId: number): Promise<void> {
    const channelServiceUrl = getServiceUrl('CHANNEL');
    const url = `${channelServiceUrl}/api/accounts/${botId}/channel`;
    
    console.log('🗑️ Deleting channel configuration...');
    console.log('Bot ID:', botId);
    console.log('URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      console.log('📡 Delete channel config response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Delete channel config error response:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        result = await response.json();
        console.log('✅ Delete channel config success response:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse success response:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!result.success) {
        console.error('❌ Delete channel config returned success=false:', result);
        throw new Error(result.message || result.error || 'Failed to delete channel configuration');
      }

      console.log('✅ Channel configuration deleted successfully');
    } catch (error: any) {
      console.error('❌ Delete channel config API call failed:', error);
      throw error;
    }
  }
}

