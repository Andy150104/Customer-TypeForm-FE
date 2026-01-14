/**
 * Custom Error Types for Better Error Handling
 *
 * Instead of formatting errors as strings ("403: message"),
 * we use typed error objects that preserve HTTP status codes
 * and can be directly consumed by Error Boundary.
 */

/**
 * HTTP Error with status code
 * Extends native Error to work with Error Boundary
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: string,
  ) {
    super(message);
    this.name = "HttpError";

    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }

  /**
   * Format for display: includes status code if available
   */
  toString(): string {
    if (this.statusCode) {
      return `HTTP ${this.statusCode}: ${this.message}`;
    }
    return this.message;
  }

  /**
   * Create HttpError from action result
   */
  static fromActionResult(result: {
    error: string;
    status?: number;
    details?: string;
  }): HttpError {
    return new HttpError(result.error, result.status, result.details);
  }
}

/**
 * Error object for store state
 * (Non-throwing version for state management)
 */
export interface StoreError {
  message: string;
  status?: number;
  details?: string;
  timestamp?: number;
}

/**
 * Helper to create StoreError from action result
 */
export function createStoreError(result: {
  error: string;
  status?: number;
  details?: string;
}): StoreError {
  return {
    message: result.error,
    status: result.status,
    details: result.details,
    timestamp: Date.now(),
  };
}

/**
 * Helper to throw HttpError from store error
 */
export function throwStoreError(error: StoreError): never {
  throw new HttpError(error.message, error.status, error.details);
}

/**
 * Type guard to check if error is HttpError
 */
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

/**
 * Extract error info from any error type
 */
export function extractErrorInfo(error: unknown): {
  message: string;
  status?: number;
  details?: string;
} {
  if (isHttpError(error)) {
    return {
      message: error.message,
      status: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: String(error),
  };
}
