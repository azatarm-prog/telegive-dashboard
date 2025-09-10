import { z } from 'zod';
import { VALIDATION, FILE_UPLOAD } from './constants';

export const loginSchema = z.object({
  botToken: z.string()
    .min(1, 'Bot token is required')
    .regex(/^\d+:[A-Za-z0-9_-]+$/, 'Invalid bot token format'),
});

export const giveawaySchema = z.object({
  title: z.string()
    .min(VALIDATION.MIN_TITLE_LENGTH, `Title must be at least ${VALIDATION.MIN_TITLE_LENGTH} characters`)
    .max(VALIDATION.MAX_TITLE_LENGTH, `Title cannot exceed ${VALIDATION.MAX_TITLE_LENGTH} characters`),
  mainBody: z.string()
    .min(VALIDATION.MIN_BODY_LENGTH, `Main body must be at least ${VALIDATION.MIN_BODY_LENGTH} characters`)
    .max(VALIDATION.MAX_BODY_LENGTH, `Main body cannot exceed ${VALIDATION.MAX_BODY_LENGTH} characters`),
  winnerCount: z.number()
    .min(VALIDATION.MIN_WINNER_COUNT, `Winner count must be at least ${VALIDATION.MIN_WINNER_COUNT}`)
    .max(VALIDATION.MAX_WINNER_COUNT, `Winner count cannot exceed ${VALIDATION.MAX_WINNER_COUNT}`),
});

export const finishMessagesSchema = z.object({
  conclusionMessage: z.string()
    .min(VALIDATION.MIN_MESSAGE_LENGTH, `Conclusion message must be at least ${VALIDATION.MIN_MESSAGE_LENGTH} characters`)
    .max(VALIDATION.MAX_MESSAGE_LENGTH, `Conclusion message cannot exceed ${VALIDATION.MAX_MESSAGE_LENGTH} characters`),
  winnerMessage: z.string()
    .min(VALIDATION.MIN_MESSAGE_LENGTH, `Winner message must be at least ${VALIDATION.MIN_MESSAGE_LENGTH} characters`)
    .max(VALIDATION.MAX_MESSAGE_LENGTH, `Winner message cannot exceed ${VALIDATION.MAX_MESSAGE_LENGTH} characters`),
  loserMessage: z.string()
    .min(VALIDATION.MIN_MESSAGE_LENGTH, `Loser message must be at least ${VALIDATION.MIN_MESSAGE_LENGTH} characters`)
    .max(VALIDATION.MAX_MESSAGE_LENGTH, `Loser message cannot exceed ${VALIDATION.MAX_MESSAGE_LENGTH} characters`),
});

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (file.size > FILE_UPLOAD.MAX_SIZE) {
    return {
      isValid: false,
      error: `File size cannot exceed ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB`,
    };
  }

  const isImage = FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = FILE_UPLOAD.ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload an image or video file.',
    };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

