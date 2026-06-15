// src/components/SellerInfo.tsx
import React from 'react';
import type { Seller } from '@/types/product'; // Assuming correct path to types
import { Star } from 'lucide-react';

interface SellerInfoProps {
  seller: Seller;
}

const SellerInfo: React.FC<SellerInfoProps> = ({ seller }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer transition-shadow hover:shadow-md mb-4">
      {/* Seller Profile Image */}
      <img
        src={seller.profileImageUrl}
        alt={seller.name}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        onError={(e) => {
          e.currentTarget.src = 'https://i.pravatar.cc/150?img=50';
        }} // Fallback
      />

      <div className="flex-grow">
        {/* Seller Name */}
        <p className="font-bold text-gray-900 text-base">{seller.name}</p>

        {/* Stats: Rating and Followers */}
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span>{seller.rating.toFixed(1)}</span>
          </div>
          <span className="text-gray-400">•</span>
          <span>{seller.followers} Followers</span>
        </div>
      </div>

      {/* Optional: Add a 'View Profile' or 'Chat' button here */}
    </div>
  );
};

export default SellerInfo;
