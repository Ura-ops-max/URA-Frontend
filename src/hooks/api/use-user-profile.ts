import { fetchFollowList, getBusinessQueryFn, getUserQueryFn, toggleBookmarkApi, toggleFollowUser } from "@/lib/api";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateProfileMutationFn, updateBusinessMutationFn } from "@/lib/api";
import { toast } from "react-hot-toast";

export const useUserProfile = (targetId: string | undefined, isBusiness: boolean) => {
  return useQuery({
    // Include isBusiness in the key so caching is distinct for users vs businesses
    queryKey: ["profile", targetId, isBusiness ? 'business' : 'user'],

    queryFn: () => {
      if (!targetId) throw new Error("ID is required");
      return isBusiness ? getBusinessQueryFn(targetId) : getUserQueryFn(targetId);
    },

    // Enable only if targetId exists
    enabled: !!targetId,

    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileMutationFn,
    onMutate: () => {
      // Optional: This fires the MOMENT the button is clicked
      // toast.loading("Uploading images and saving..."); 
    },
    onSuccess: (_data) => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });
};

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBusinessMutationFn,
    onSuccess: () => {
      toast.success("Business details saved!");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Business update failed");
    },
  });
};



// src/hooks/use-profile-actions.ts
export const useProfileActions = (targetId: string, isBusiness: boolean) => {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    // Pass both variables to the API call
    mutationFn: () => toggleFollowUser(targetId, isBusiness),

    onSuccess: (data) => {
      // data contains the { message, isFollowing } from your backend
      queryClient.invalidateQueries({ queryKey: ["profile", targetId] });
      queryClient.invalidateQueries({ queryKey: ["socialList"] });

      // Personalized toast based on the server response
      toast.success(data.isFollowing ? "Followed!" : "Unfollowed");
    },
    onError: () => toast.error("Action failed. Please try again."),
  });

  return {
    follow: followMutation.mutate,
    isFollowingLoading: followMutation.isPending,
  };
};


export const useBookmark = (targetId: string, profileKey: any[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    // Using the separate mutation function here
    mutationFn: (targetType: "Business" | "Post") => toggleBookmarkApi(targetId, targetType),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: profileKey });
      toast.success(data.isBookmarked ? "Saved to bookmarks" : "Removed from bookmarks");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Bookmark action failed";
      toast.error(message);
    },
  });
};




export const useFollowData = (targetId: string, type: "followers" | "following") => {
  return useQuery({
    queryKey: ["socialList", targetId, type],
    queryFn: () => fetchFollowList(targetId, type),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};