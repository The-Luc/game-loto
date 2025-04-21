import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from 'sonner';
import { ErrorResponse } from './types';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Central error handling function that extracts error message
 * Note: This is safe to use in both client and server contexts
 */
export function handleError(error: unknown, defaultMessage = 'An error occurred'): string {
  let errorMessage = defaultMessage;

  // Extract error message based on error type
  if (error) {
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error === 'object' && error !== null) {
      // Handle API error responses
      // Use type predicates to check for error property
      if ('error' in error && typeof error.error === 'string') {
        errorMessage = error.error;
      }
      // Use type predicates to check for message property
      else if ('message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      }
    }
  }

  // Log to console for debugging (works in both client and server)
  console.error('Error:', error);

  return errorMessage;
}

/**
 * Client-side only: Show an error toast notification
 * Must only be used in client components
 */
export function showErrorToast(message: string) {
  // Only call toast in a browser environment
  if (typeof window !== 'undefined') {
    toast.error(message);
  }
}

/**
 * Client-side only: Show a success toast notification
 * Must only be used in client components
 */
export function showSuccessToast(message: string) {
  // Only call toast in a browser environment
  if (typeof window !== 'undefined') {
    toast.success(message);
  }
}

/**
 * Handle API response with proper error handling
 * Safe to use in server components/actions
 */
export function handleApiResponse<T extends ErrorResponse>(
  response: T
): T {
  if (!response.success && response.error) {
    // Just log the error, don't try to show toast from server context
    console.error('API Error:', response.error);
  }

  return response;
}

/**
 * Client-side only: Handle API response with toast notifications
 * Must only be used in client components
 */
export function handleApifResponseWithToast<T extends ErrorResponse>(
  response: T,
  successMessage?: string
): T {
  if (!response.success && response.error) {
    const errorMsg = handleError(response.error);
    showErrorToast(errorMsg);
  } else if (successMessage) {
    showSuccessToast(successMessage);
  }

  return response;
}
