// src/components/ProductDetails.tsx (UPDATED INTEGRATION)
import React, { useEffect, useState } from 'react';
import { mockApi } from '@/services/mockApi';
import type { SingleProduct } from '@/types/product';
import { ArrowLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import SellerInfo from '@/components/product/SellerInfo'; // <-- IMPORTED NEW COMPONENT

const ProductDetails: React.FC = () => {
  // ... (State and useEffect remain the same)
  const [product, setProduct] = useState<SingleProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await mockApi.get('single-product');
        if (data) setProduct(data as SingleProduct);
        else setError('Product not found');
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);
  // ...

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error || !product) return <div className="p-10 text-center text-red-500">{error}</div>;

  const DetailItem: React.FC<{ label: string; value: string | number; isPrice?: boolean }> = ({
    label,
    value,
    isPrice,
  }) => (
    <div className="flex items-center space-x-2 text-lg">
      <ChevronRight className="w-5 h-5 text-orange-500 flex-shrink-0" />
      <span className="font-semibold text-gray-800">{label} :</span>
      <span className={`${isPrice ? 'text-green-700 font-bold' : 'text-gray-900'}`}>
        {isPrice ? `${product.currencySymbol}${Number(value).toLocaleString()}` : value}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Top Nav */}
      <div className="lg:hidden flex items-center p-4 border-b">
        <ArrowLeft className="w-6 h-6" />
        <h1 className="ml-auto mr-auto text-xl font-bold">Product</h1>
      </div>

      {/* Desktop Top Nav (Simple breadcrumb) */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-8 py-6">
        <button className="flex items-center text-gray-600 hover:text-black transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-xl font-medium">Products</span>
        </button>
      </div>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-center lg:min-h-[70vh] gap-8 lg:gap-16 lg:py-8 py-6">
        {/* Image Section */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://picsum.photos/600/600?text=Product+Image';
              }}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-6">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h2>

            {/* NEW: Seller Information */}
            <SellerInfo seller={product.seller} />

            <div className="space-y-2 pt-4">
              {' '}
              {/* Added padding to separate from SellerInfo */}
              <h3 className="text-xl font-bold text-gray-800">Description</h3>
              <p className="text-gray-600 text-lg leading-relaxed max-w-md">
                {product.description}
              </p>
            </div>
          </div>

          <div className="space-y-4 py-4">
            <DetailItem label="Price" value={product.price} isPrice />
            <DetailItem label="Available Stocks" value={product.availableStocks} />
            <DetailItem label="Size" value={product.size} />
          </div>

          {/* CTA Button */}
          <div className="lg:pt-4">
            <button className="flex items-center justify-center space-x-2 w-full lg:w-max lg:px-12 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl lg:rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-95">
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
