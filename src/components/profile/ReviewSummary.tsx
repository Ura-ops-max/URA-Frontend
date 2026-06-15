// src/components/ReviewSummary.tsx
import React from 'react';
import type { ReviewSummaryData, ReviewDistribution } from '@/types/review';
import ReviewBar from './ReviewBar';
import { Edit } from 'lucide-react';

interface ReviewSummaryProps {
  summary: ReviewSummaryData;
  onAddReview: () => void; // NEW PROP: Handler for adding review
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ summary, onAddReview }) => {
  const counts = Object.values(summary.distribution).map(Number);
  const maxCount = Math.max(...counts);

  const formattedRating = summary.averageRating.toFixed(1);
  const starRating = Math.round(summary.averageRating);

  const starLevels = [5, 4, 3, 2, 1];

  return (
    <div className="mb-6 p-5 border-b border-gray-100">
      {' '}
      {/* Adjusted padding/border */}
      <h3 className="text-xl font-bold mb-4 text-gray-800">Reviews Summary</h3>
      <div className="flex justify-between items-start">
        {/* Left Side: Average Rating */}
        <div className="flex flex-col items-center mr-6">
          <p className="text-4xl font-bold text-gray-800">{formattedRating}</p>
          <div className="flex text-2xl mt-1">
            {Array(5)
              .fill(0)
              .map(
                (
                  _,
                  i, // Render stars here
                ) => (
                  <span key={i} className={i < starRating ? 'text-orange-500' : 'text-gray-300'}>
                    ★
                  </span>
                ),
              )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{summary.totalReviews} reviews</p>{' '}
          {/* Added "reviews" for clarity */}
        </div>

        {/* Right Side: Distribution Bars */}
        <div className="flex-grow">
          {starLevels.map((star) => (
            <ReviewBar
              key={star}
              stars={star}
              count={summary.distribution[star as keyof ReviewDistribution] || 0}
              maxCount={maxCount}
            />
          ))}
        </div>
      </div>
      {/* Add Review Button */}
      <button
        onClick={onAddReview} // Use the new prop
        className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 w-full text-orange-500 font-medium hover:text-orange-600 transition-colors"
      >
        <span>Add Review</span>
        <Edit className="text-lg w-5 h-5" />
      </button>
    </div>
  );
};

export default ReviewSummary;
