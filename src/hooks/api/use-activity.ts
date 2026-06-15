import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/axios-client'; // Your API instance

export const useActivity = (options = {}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['activityList'],
    queryFn: async () => {
      const response = await API.get('/logs/activities');
      return response.data;
    },
    refetchInterval: 60000,
    ...options,
  });

  const clearMutation = useMutation({
    mutationFn: () => API.delete('/logs/activities/clear-all'),
    onSuccess: () => {
      // Refresh the list immediately
      queryClient.invalidateQueries({ queryKey: ['activityList'] });
    },
  });

  return {
    activities: data ?? [],
    isLoading,
    isError,
    clearAll: clearMutation.mutate,
    isClearing: clearMutation.isPending,
  };
};
