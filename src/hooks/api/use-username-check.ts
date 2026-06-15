// src/hooks/api/use-username-check.ts (REVISED with Error Parsing)

import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { checkUsernameAvailability } from '@/lib/api';
import { AxiosError } from 'axios';

const USERNAME_QUERY_KEY = ['username-availability'];

// Define a type for the validation error details for strong typing
interface BackendErrorDetail {
  field: string;
  message: string;
  location: string;
}

interface BackendErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: BackendErrorDetail[];
  };
}

export const useUsernameCheck = (username: string | undefined) => {
  const safeUsername = username ?? '';
  const [debouncedUsername] = useDebounce(safeUsername, 500);

  const query = useQuery({
    enabled: debouncedUsername.length > 2,
    queryKey: [...USERNAME_QUERY_KEY, debouncedUsername],

    // Use an anonymous function to wrap the API call and handle errors
    queryFn: async () => {
      try {
        return await checkUsernameAvailability(debouncedUsername);
      } catch (err) {
        const error = err as AxiosError<BackendErrorResponse>;
        const errorData = error.response?.data;

        // If the error is a Joi VALIDATION_ERROR (400)
        if (error.response?.status === 400 && errorData?.error.code === 'VALIDATION_ERROR') {
          // Extract the Joi message specific to the username field
          const usernameDetail = errorData.error.details?.find((d) => d.field === 'username');

          // Throw a specific error object that the component can catch
          if (usernameDetail) {
            throw new Error(usernameDetail.message);
          }
        }

        // Re-throw any other unexpected error (500, etc.)
        throw err;
      }
    },

    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
  });

  return {
    isChecking: query.isFetching,
    isAvailable: query.data?.available,
    // Check for two error types: unique check (data) or validation error (query.error)
    isTakenError: query.data?.available === false ? query.data.message : undefined,
    isValidationError: query.error instanceof Error ? query.error.message : undefined,
  };
};
