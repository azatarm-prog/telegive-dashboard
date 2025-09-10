import apiClient from './api';
import { ParticipantListResponse } from '../types/participant';

export class ParticipantService {
  static async getParticipants(
    giveawayId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<ParticipantListResponse> {
    const response = await apiClient.get<ParticipantListResponse>(
      `/api/participants/list/${giveawayId}?page=${page}&limit=${limit}`
    );

    if (!response.success) {
      throw new Error('Failed to fetch participants');
    }

    return response;
  }

  static async exportParticipants(giveawayId: number): Promise<Blob> {
    const response = await apiClient.get(
      `/api/participants/export/${giveawayId}`,
      { responseType: 'blob' }
    );

    return response;
  }

  static async getParticipantStats(giveawayId: number) {
    const response = await apiClient.get<{
      success: boolean;
      stats: {
        total: number;
        captcha_completed: number;
        captcha_pending: number;
        winners?: number;
      };
    }>(`/api/participants/stats/${giveawayId}`);

    if (!response.success) {
      throw new Error('Failed to fetch participant statistics');
    }

    return response.stats;
  }
}

