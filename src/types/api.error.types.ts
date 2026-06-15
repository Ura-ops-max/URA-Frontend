export interface ValidationErrorDetail {
  field: string; // The name of the field causing the error (e.g., 'password', 'email')
  message: string; // The specific validation message
  location: string; // 'body', 'query', 'params', etc.
}

export interface BackendErrorResponse {
  success: false;
  message: string; // e.g., "Validation failed"
  error: {
    code: string; // e.g., "VALIDATION_ERROR"
    details: ValidationErrorDetail[]; // Array of field-specific errors
    stack?: string; // Optional stack trace
  };
}
