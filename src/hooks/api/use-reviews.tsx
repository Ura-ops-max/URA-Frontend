import { useState, useEffect, useCallback } from 'react';
import { reviewAPI, type CreateReviewData } from '@/lib/api';
import { toast } from 'sonner';

export const useReviews = (itemId: string) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!itemId) return;
    setIsLoading(true);
    try {
      const response = await reviewAPI.getItemReviews(itemId);
      // Accessing data from your backend response structure
      const data = response.data.data;
      setReviews(data);
    } catch (err: any) {
      console.error('Review fetch error:', err);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  // Create Logic
  const addReview = async (data: CreateReviewData) => {
    try {
      await reviewAPI.createReview(data);
      toast.success('Review submitted!');
      await fetchReviews();
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Edit Logic
  const editReview = async (reviewId: string, data: { rating?: number; comment?: string }) => {
    try {
      await reviewAPI.updateReview(reviewId, data);
      toast.success('Review updated!');
      await fetchReviews();
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update review';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Delete Logic
  const handleDelete = async (reviewId: string) => {
    try {
      await reviewAPI.deleteReview(reviewId);
      toast.success('Review deleted successfully');
      await fetchReviews();
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete review';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const handleLike = async (reviewId: string) => {
    try {
      await reviewAPI.likeReview(reviewId);
      await fetchReviews();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not process like';
      toast.error(msg);
    }
  };

  const handleDislike = async (reviewId: string) => {
    try {
      await reviewAPI.dislikeReview(reviewId);
      await fetchReviews();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not process dislike';
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    isLoading,
    addReview,
    editReview,
    handleDelete,
    handleLike,
    handleDislike,
    refreshReviews: fetchReviews,
  };
};
