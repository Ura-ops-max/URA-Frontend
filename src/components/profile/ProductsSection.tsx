// src/components/ProductsSection.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { mockApi } from '@/services/mockApi';
import type { Product } from '@/types/product';
import ProductCard from '@/components/profile/ProductCard';

// Component for the category pill buttons
interface CategoryPillProps {
  category: string;
  isActive: boolean;
  onClick: (category: string) => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ category, isActive, onClick }) => (
  <button
    onClick={() => onClick(category)}
    className={`
      px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
      ${
        isActive
          ? 'bg-orange-500 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }
    `}
  >
    {category}
  </button>
);

const ProductsSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the currently active category filter
  // 'All' is the default category that shows all products
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      const data = await mockApi.get('products');
      if (data) {
        setProducts(data as Product[]);
      } else {
        setError('Failed to load products. Check mock-data/products.json.');
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // 1. Get a unique list of categories from the products
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach((p) => categorySet.add(p.category));
    // Always include 'All' as the first option
    return ['All', ...Array.from(categorySet)];
  }, [products]);

  // 2. Filter the products based on the active category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') {
      return products;
    }
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading products...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="">
      {/* Category Pills/Buttons */}
      <div className="overflow-x-auto whitespace-nowrap mb-4 pb-2 -mx-4 scrollbar-hide">
        <div className="inline-flex space-x-2">
          {categories.map((category) => (
            <CategoryPill
              key={category}
              category={category}
              isActive={category === activeCategory}
              onClick={setActiveCategory}
            />
          ))}
        </div>
      </div>

      {/* Category Title (e.g., "Food & Drinks" or Active Category) */}
      <h3 className="text-lg font-bold mb-4 text-gray-800">
        {activeCategory}
        {activeCategory === 'All'} {/* Optional: add context */}
      </h3>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-col-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No products found in this category.</p>
      )}
    </div>
  );
};

export default ProductsSection;
