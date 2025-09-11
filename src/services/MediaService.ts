import apiClient from './api';
import { FileUploadResponse } from '../types';

export class MediaService {
  static async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    const response = await apiClient.uploadFile<FileUploadResponse>(
      '/api/media/upload',
      file,
      onProgress
    );

    if (!response.success) {
      throw new Error('Failed to upload file');
    }

    return response;
  }

  static async deleteFile(filename: string): Promise<void> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/api/media/delete/${filename}`
    );

    if (!response.success) {
      throw new Error('Failed to delete file');
    }
  }

  static getFileUrl(filename: string): string {
    const baseUrl = import.meta.env.VITE_TELEGIVE_MEDIA_URL || 'https://telegive-media-production.up.railway.app';
    return `${baseUrl}/api/media/files/${filename}`;
  }

  static async getFileInfo(filename: string) {
    const response = await apiClient.get<{
      success: boolean;
      file: {
        filename: string;
        size: number;
        type: string;
        url: string;
        created_at: string;
      };
    }>(`/api/media/info/${filename}`);

    if (!response.success) {
      throw new Error('Failed to get file information');
    }

    return response.file;
  }
}

