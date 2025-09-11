import { ParticipantListResponse } from '../types/participant';
import { getServiceUrl } from './serviceConfig';
import { STORAGE_KEYS } from '../utils/constants';

export class ParticipantService {
  private static getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  static async getParticipants(
    giveawayId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<ParticipantListResponse> {
    const participantServiceUrl = getServiceUrl('PARTICIPANT');
    const response = await fetch(`${participantServiceUrl}/api/participants/list/${giveawayId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch participants');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to fetch participants');
    }

    return result;
  }

  static async exportParticipants(giveawayId: number): Promise<Blob> {
    const participantServiceUrl = getServiceUrl('PARTICIPANT');
    const response = await fetch(`${participantServiceUrl}/api/participants/export/${giveawayId}`, {
      method: 'GET',
      headers: {
        ...(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) && { 
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}` 
        })
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export participants');
    }

    return response.blob();
  }

  static async getParticipantStats(giveawayId: number) {
    const participantServiceUrl = getServiceUrl('PARTICIPANT');
    const response = await fetch(`${participantServiceUrl}/api/participants/stats/${giveawayId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch participant statistics');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to fetch participant statistics');
    }

    return result.stats;
  }
}

