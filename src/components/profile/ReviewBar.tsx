// src/components/ReviewBar.tsx
import React from 'react';

interface ReviewBarProps {
  stars: number;
  count: number;
  maxCount: number; // The highest count among all stars for relative width calculation
}

const ReviewBar: React.FC<ReviewBarProps> = ({ stars, count, maxCount }) => {
  const widthPercentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <span className="w-2">{stars}</span>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${widthPercentage}%` }}
        />
      </div>
      <span className="w-4 text-right">{count}</span>
    </div>
  );
};

export default ReviewBar;
