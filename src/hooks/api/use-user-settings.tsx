import { useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/axios-client';
import { toast } from 'sonner';

export const useUserSettings = () => {
  const queryClient = useQueryClient();

  // Update Password
  const updatePassword = useMutation({
    mutationFn: (data: any) => API.put('/settings/update-password', data),
    onSuccess: () => toast.success('Password updated successfully'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update password'),
  });

  // Update Email
  // hooks/api/use-user-settings.ts

  // ... inside useUserSettings hook ...

  // Update Email
  const updateEmail = useMutation({
    // Change the type here to include password 👇
    mutationFn: (data: { newEmail: string; password: string }) =>
      API.put('/settings/update-email', data),

    onSuccess: () => {
      toast.success('Email updated. Please verify your new email.');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update email'),
  });

  // Resend Verification
  const resendVerification = useMutation({
    mutationFn: () => API.post('/settings/resend-verification'),
    onSuccess: () => toast.success('Verification email sent!'),
    onError: () => toast.error('Failed to send verification email'),
  });

  return { updatePassword, updateEmail, resendVerification };
};
