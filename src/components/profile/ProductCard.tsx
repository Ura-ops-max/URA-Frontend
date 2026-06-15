// src/components/ProductCard.tsx
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition transform cursor-pointer flex flex-col">
      {/* Image */}
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-gray-800 font-semibold text-lg line-clamp-2">{product.name}</h4>
        <p className="text-gray-600 mt-1 text-sm line-clamp-2">{product.description}</p>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-orange-500 font-semibold">₦{product.price.toLocaleString()}</span>
          <span className="text-gray-500 text-sm">In stock: {product.stock}</span>
        </div>

        {/* Buttons */}
        <div className="mt-3 flex gap-2">
          <button className="flex-1 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition">
            Add to Cart
          </button>
          <button className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
