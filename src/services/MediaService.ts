import { FileUploadResponse } from '../types';
import { getServiceUrl } from './serviceConfig';
import { STORAGE_KEYS } from '../utils/constants';

export class MediaService {
  private static getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  static async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    const mediaServiceUrl = getServiceUrl('MEDIA');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${mediaServiceUrl}/api/media/upload`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload file');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to upload file');
    }

    return result;
  }

  static async deleteFile(filename: string): Promise<void> {
    const mediaServiceUrl = getServiceUrl('MEDIA');
    const response = await fetch(`${mediaServiceUrl}/api/media/delete/${filename}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete file');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to delete file');
    }
  }

  static getFileUrl(filename: string): string {
    const baseUrl = import.meta.env.VITE_TELEGIVE_MEDIA_URL || 'https://telegive-media-production.up.railway.app';
    return `${baseUrl}/api/media/files/${filename}`;
  }

  static async getFileInfo(filename: string) {
    const mediaServiceUrl = getServiceUrl('MEDIA');
    const response = await fetch(`${mediaServiceUrl}/api/media/info/${filename}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get file information');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to get file information');
    }

    return result.file;
  }
}

