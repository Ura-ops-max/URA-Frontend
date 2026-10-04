import { consumeReturnTo } from '@/lib/return-to';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginMutationFn, registerMutationFn, logoutMutationFn } from '@/lib/api';
import { tokenStorage } from '@/lib/token-storage';
import type { LoginResponseType, RegisterResponseType } from '@/types/api.types';
import type { AxiosError } from 'axios';
import type { UseFormSetError } from 'react-hook-form';

import type { BackendErrorResponse } from '@/types/api.error.types';
import type { RegisterFormData } from '@/pages/auth/SignUp';
interface UseRegisterProps {
  setError: UseFormSetError<RegisterFormData>;
  setGlobalError: React.Dispatch<React.SetStateAction<string>>;
}

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginMutationFn,
    onSuccess: (data: LoginResponseType) => {
      tokenStorage.setToken(data.data.accessToken);
      tokenStorage.setRefreshToken(data.data.refreshToken);

      queryClient.invalidateQueries({ queryKey: ['authUser'] });

      toast.success(data.message || 'Login successful!');
      navigate(consumeReturnTo('/dashboard'));
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    },
  });
};

export const useRegister = ({ setError, setGlobalError }: UseRegisterProps) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerMutationFn,

    onSuccess: (response: RegisterResponseType) => {
      const message =
        response?.message || 'Registration successful! Check your email for verification.';
      toast.success(message);
      navigate('/auth/login');
    },

    onError: (error: AxiosError<BackendErrorResponse | undefined>) => {
      setGlobalError('');
      const errorData = error.response?.data;
      const status = error.response?.status;
      console.log('status', status);
      console.log('errorData', errorData);
      if ((status === 400 || status === 409) && errorData?.error.details) {
        console.log('errorData', errorData);
        let fieldsHandled = false;

        errorData.error.details.forEach((detail) => {
          const field = detail.field as keyof RegisterFormData;

          if (['firstName', 'lastName', 'email', 'password', 'username'].includes(field)) {
            setError(field, {
              type: 'server',
              message: detail.message,
            });
            fieldsHandled = true;
          }
        });

        if (fieldsHandled) {
          toast.error('Please correct the highlighted fields.');
        } else {
          // Fallback for structured error if the field wasn't recognized
          setGlobalError(errorData.message || 'Validation failed. Check inputs.');
        }
        return;
      }

      // Generic/Server Errors (500, unhandled 400/409 without details, network issues)
      else {
        const userFriendlyMessage = 'Registration failed. Please try again later.';
        const toastMessage = errorData?.message || userFriendlyMessage;

        toast.error(toastMessage);
        setGlobalError(userFriendlyMessage);
      }
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      return logoutMutationFn(refreshToken || undefined);
    },
    onSuccess: () => {
      tokenStorage.clearTokens();
      queryClient.clear();

      toast.success('Logged out successfully');
      navigate('/auth/login');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      tokenStorage.clearTokens();
      queryClient.clear();

      const message = error.response?.data?.message || 'Logout failed';
      toast.error(message);

      navigate('/auth/login');
    },
  });
};
