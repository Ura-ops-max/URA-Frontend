import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Package, Search, Upload, Megaphone, PlusCircle, Send, Rocket } from 'lucide-react';
import { FormField } from './shared/FormElement';
import { TagInput } from '../shared/TagInput';
import { toast } from 'sonner';
import { MediaPreview } from './shared/MediaPreview';
import { useAuthContext } from '@/context/auth-provider';
import { useCreatePost } from '@/hooks/api/use-feed';
import API from '@/lib/axios-client';

const MakePostForm = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthContext();
  const isBusiness = user?.isBusinessOwner;

  // --- API LOGIC ---
  const { mutate: createPost, isPending: isSubmitting } = useCreatePost();
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);

  const [postType, setPostType] = useState<'normal' | 'product'>(
    searchParams.get('attach') ? 'product' : 'normal',
  );

  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [media, setMedia] = useState<{ file: File; preview: string; type: 'image' | 'video' }[]>(
    [],
  );
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // --- FETCH REAL INVENTORY ---
  useEffect(() => {
    if (isBusiness && postType === 'product') {
      const fetchInventory = async () => {
        setFetchingProducts(true);
        try {
          const res = await API.get('/products/mine');
          if (res.data.success) setMyProducts(res.data.products);
        } catch (err) {
          toast.error('Could not load your inventory');
        } finally {
          setFetchingProducts(false);
        }
      };
      fetchInventory();
    }
  }, [isBusiness, postType]);

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Note: backend uses _id
    const prod = myProducts.find((p) => p._id === e.target.value);
    setSelectedProduct(prod);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newMedia = files.map((file) => {
      const isVideo = file.type.startsWith('video');
      return {
        file,
        preview: URL.createObjectURL(file),
        type: (isVideo ? 'video' : 'image') as 'image' | 'video',
      };
    });
    setMedia((prev) => [...prev, ...newMedia]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!caption.trim()) return toast.error('Caption is compulsory!');
    if (postType === 'product' && !selectedProduct) return toast.error('Please link a product!');
    // if (postType === 'normal' && media.length === 0) return toast.error("Please add some media!");

    // Construct the data to match your backend validator
    const payload = {
      data: {
        type: 'POST', // In our DB, feed items are 'POST' entries
        caption,
        tags,
        productId: selectedProduct?._id, // Send the real MongoDB ID
      },
      files: media.map((m) => m.file),
    };

    createPost(payload, {
      onSuccess: () => {
        // Clear form on success
        setCaption('');
        setTags([]);
        setMedia([]);
        setSelectedProduct(null);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* POST TYPE SWITCHER */}
      {isBusiness && (
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setPostType('normal')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${postType === 'normal' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Megaphone size={16} /> General Post
          </button>
          <button
            type="button"
            onClick={() => setPostType('product')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${postType === 'product' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Package size={16} /> Product Post
          </button>
        </div>
      )}

      {/* SECTION 1: VISUAL CONTENT */}
      {postType === 'normal' ? (
        <section className="animate-in fade-in slide-in-from-top-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Media Upload</label>
          <label className="mt-2 flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-[32px] bg-gray-50/50 hover:bg-orange-50/50 hover:border-orange-200 cursor-pointer transition-all group">
            <Upload className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mb-2" />
            <span className="text-xs font-bold text-gray-400 uppercase">Photos / Video</span>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
          </label>
          <MediaPreview
            files={media}
            onRemove={(idx) => setMedia(media.filter((_, i) => i !== idx))}
          />
        </section>
      ) : (
        <section className="animate-in fade-in slide-in-from-top-2 space-y-4">
          <div className="flex items-center justify-between ml-1">
            <label className="text-sm font-bold text-gray-700">Select Product</label>
            <button
              type="button"
              onClick={() => setSearchParams({ type: 'product' })}
              className="text-[10px] font-black text-orange-600 flex items-center gap-1 hover:underline"
            >
              <PlusCircle size={12} /> NEW PRODUCT
            </button>
          </div>

          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={18}
            />
            <select
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-[24px] text-sm font-bold outline-none focus:border-orange-500 appearance-none cursor-pointer"
              onChange={handleProductSelect}
              value={selectedProduct?._id || ''}
              disabled={fetchingProducts}
            >
              <option value="" disabled>
                {fetchingProducts ? 'Loading inventory...' : 'Search your shop...'}
              </option>
              {myProducts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — ₦{p.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-4 animate-in fade-in zoom-in-95">
              <img
                src={selectedProduct.media?.[0]}
                className="w-16 h-16 rounded-xl object-cover border border-white shadow-sm"
                alt="selected"
              />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900">{selectedProduct.name}</h4>
                <p className="text-xs font-bold text-orange-600">
                  ₦{selectedProduct.price.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                  In Stock: {selectedProduct.stock}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: CAPTION */}
      <FormField label="Caption (Required)">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={postType === 'product' ? 'Announce this item...' : "What's happening?"}
          className="w-full p-5 bg-gray-50 border border-gray-200 rounded-[28px] h-32 resize-none outline-none focus:border-orange-500 transition-all text-sm font-medium"
        />
      </FormField>

      {/* SECTION 3: TAGS */}
      <FormField label="Tags">
        <TagInput tags={tags} setTags={setTags} tagInput={tagInput} setTagInput={setTagInput} />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-5 bg-orange-500 text-white rounded-[28px] font-black text-lg shadow-xl shadow-orange-100 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">Uploading...</span>
        ) : (
          <>
            <span>{postType === 'product' ? 'Share Product' : 'Share Post'}</span>
            {postType === 'product' ? <Rocket size={20} /> : <Send size={20} />}
          </>
        )}
      </button>
    </form>
  );
};

export default MakePostForm;
