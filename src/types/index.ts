export * from './auth';
export * from './giveaway';
export * from './participant';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface FileUploadResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  type: string;
}

