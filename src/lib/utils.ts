import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from 'sonner';
import { ErrorResponse } from '../types';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Central error handling function that shows toast notifications
 */
export function handleError(error: unknown, defaultMessage = 'An error occurred'): string {
  let errorMessage = defaultMessage;

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    // Handle API error responses
    if ('error' in error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if ('message' in error && typeof error.message === 'string') {
      errorMessage = error.message;
    }
  }

  // Show toast notification
  toast.error(errorMessage);

  // Also log to console for debugging
  console.error('Error:', error);

  return errorMessage;
}

/**
 * Success notification helper
 */
export function showSuccess(message: string) {
  toast.success(message);
}

/**
 * Handle API response with proper error handling
 */
export function handleApiResponse<T extends ErrorResponse>(
  response: T,
  successMessage?: string
): T {
  if (!response.success && response.error) {
    handleError(response.error);
  } else if (successMessage) {
    showSuccess(successMessage);
  }

  return response;
}
