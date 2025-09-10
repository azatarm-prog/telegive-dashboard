/**
 * Simple validation utilities for the Telegive Dashboard
 */

export const validateBotToken = (token: string): boolean => {
  // Basic bot token validation - should start with a number and contain :
  return /^\d+:[A-Za-z0-9_-]+$/.test(token);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
