// src/components/ReviewsSection.tsx
import React, { useState } from 'react';
import { useReviews } from '@/hooks/api/use-reviews';
import ReviewSummary from '@/components/profile/ReviewSummary';
import ReviewCard from '@/components/profile/ReviewCard';
import WriteReviewForm from './WriteReview'; // NEW IMPORT
import { Loader2, Edit } from 'lucide-react'; // NEW IMPORT for Edit icon
import { Button } from '@/components/ui/button'; // NEW IMPORT for Button
import { AnimatePresence, motion } from 'framer-motion';

interface ReviewsSectionProps {
  itemId: string;
  itemModel: 'Business' | 'Product'; // NEW PROP: to tell the form what kind of item is being reviewed
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ itemId, itemModel }) => {
  const { reviews, isLoading, refreshReviews, handleLike, handleDislike, handleDelete } =
    useReviews(itemId);
  const [isFormOpen, setIsFormOpen] = useState(false); // State to control form visibility
  const [editingReview, setEditingReview] = useState<any>(null);
  // Calculate summary data from live reviews for the ReviewSummary component
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0 ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews : 0;

  const distribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const summaryData = {
    totalReviews,
    averageRating,
    distribution,
  };

  const handleCloseDrawer = () => {
    setIsFormOpen(false);
    setEditingReview(null); // CRITICAL: Reset the edit state so the next form is blank
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* 1. Summary Section */}
      <ReviewSummary summary={summaryData} onAddReview={() => setIsFormOpen(true)} />{' '}
      {/* Pass handler */}
      {/* 2. Individual Reviews */}
      <div className="divide-y divide-gray-50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Loader2 className="animate-spin mb-2" />
            <p className="text-sm font-medium">Loading community reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onLike={() => handleLike(review._id)}
              onDislike={() => handleDislike(review._id)}
              onEdit={(rev) => {
                setEditingReview(rev);
                setIsFormOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-4">
            No reviews yet. Be the first to share your experience!
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-[#FF6B35] hover:bg-[#e85a20] text-white rounded-lg h-10 px-6 font-semibold transition-all active:scale-[0.98] inline-flex items-center gap-2"
            >
              <Edit size={16} /> Write a Review
            </Button>
          </div>
        )}
      </div>
      {/* The Review Form (conditionally rendered as a simple slide-in for now) */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
            {/* 1. Clear Backdrop (Visible but not blurry/dark) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/10 pointer-events-auto"
            />

            {/* 2. Modern Drag-to-Close Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setIsFormOpen(false);
              }}
              className="relative w-full max-w-lg bg-white rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] 
                   z-[110] border-t border-gray-100 pointer-events-auto touch-none"
            >
              {/* Drag Handle */}
              <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mt-5 mb-2 cursor-grab active:cursor-grabbing" />

              <WriteReviewForm
                itemId={itemId}
                itemModel={itemModel}
                initialData={editingReview}
                onReviewSubmitted={() => {
                  refreshReviews();
                  handleCloseDrawer(); // Use the cleaner close function
                }}
                onClose={handleCloseDrawer}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewsSection;
