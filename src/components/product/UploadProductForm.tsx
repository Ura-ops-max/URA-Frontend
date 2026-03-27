import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormField, StyledInput } from './shared/FormElement';
import { TagInput } from '../shared/TagInput';
import {
  Upload, Megaphone, Loader2, Archive, Sparkles,
  Search, ChevronDown, Check, ShieldCheck, Truck, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { MediaPreview } from './shared/MediaPreview';
import { useCreatePost } from '@/hooks/api/use-feed';
import { useCategories } from '@/hooks/api/use-categories';
import { cn } from '@/lib/utils';

// ─── Zod Schema ─────────────────────────────────────────────
const integratedSchema = z.object({
  name:             z.string().min(3, 'Product name is required'),
  price:            z.string().min(1, 'Price is required'),
  description:      z.string().min(10, 'Description is required'),
  stock:            z.string().min(1, 'Let us know how many stocks you have'),
  category:         z.string().min(1, 'Please select a category'),
  size:             z.string().optional(),
  caption:          z.string().optional(),

  // Payluk escrow fields
  whoPays:          z.enum(['buyer', 'seller', 'both']),
  maxDelivery:      z.string().min(1, 'Delivery window is required'),
  deliveryTimeline: z.enum(['hours', 'days', 'minutes']),
});

type FormValues = z.infer<typeof integratedSchema>;

// ─── Who Pays Options ────────────────────────────────────────
const WHO_PAYS_OPTIONS: { value: 'buyer' | 'seller' | 'both'; label: string; description: string }[] = [
  { value: 'seller', label: 'I pay the fee',    description: 'You cover the platform fee' },
  { value: 'buyer',  label: 'Buyer pays fee',   description: 'Customer covers the platform fee' },
  { value: 'both',   label: 'We split the fee', description: 'Fee is split between both parties' },
];

// ─── Timeline Options ────────────────────────────────────────
const TIMELINE_OPTIONS: { value: 'hours' | 'days' | 'minutes'; label: string }[] = [
  { value: 'hours',   label: 'Hours' },
  { value: 'days',    label: 'Days' },
  { value: 'minutes', label: 'Minutes' },
];


const UploadProductForm = () => {
  const { mutate: uploadProduct, isPending } = useCreatePost();
  const [makePost, setMakePost]   = useState(false);
  const [media, setMedia]         = useState<any[]>([]);
  const { categories } = useCategories('product');

  // Tag States
  const [tags, setTags]           = useState<string[]>([]);
  const [tagInput, setTagInput]   = useState('');

  // Category dropdown state
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(integratedSchema),
    defaultValues: {
      caption:          '',
      category:         '',
      whoPays:          'seller',
      maxDelivery:      '3',
      deliveryTimeline: 'days',
    },
  });

  const selectedCategory     = watch('category');
  const selectedWhoPays      = watch('whoPays');
  const selectedTimeline     = watch('deliveryTimeline');

  const filteredCategories = categories?.filter((cat: string) =>
      cat.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files    = Array.from(e.target.files || []);
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type:    file.type,
    }));
    setMedia([...media, ...newMedia]);
  };

  const onSubmit = async (data: FormValues) => {
    if (media.length === 0)             return toast.error('Product images are required');
    if (makePost && !data.caption)      return toast.error('Caption is required for social post');

    const payload = {
      data: {
        type:             'PRODUCT',
        productName:      data.name,
        price:            Number(data.price),
        stock:            Number(data.stock),
        description:      data.description,
        size:             data.size,
        category:         selectedCategory,
        caption:          data.caption,
        tags:             tags,
        publishToFeed:    makePost,

        // ── Payluk fields ──────────────────────────
        whoPays:          data.whoPays,
        maxDelivery:      Number(data.maxDelivery),
        deliveryTimeline: data.deliveryTimeline,
        // ──────────────────────────────────────────
      },
      files: media.map(m => m.file),
    };

    uploadProduct(payload, {
      onSuccess: () => {
        reset();
        setMedia([]);
        setTags([]);
        setMakePost(false);
      },
    });
  };

  return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* ── SECTION 1: Product Details ─────────────────── */}
        <div className="space-y-6">
          <SectionHeader label="Product Details" />

          <FormField label="Product Name" error={errors.name?.message as string}>
            <StyledInput {...register('name')} placeholder="e.g. Vintage Denim Jacket" />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Searchable Dropdown */}
            <FormField label="Category" error={errors.category?.message as string}>
              <div className="relative">
                <div
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className={cn(
                        'w-full p-4 bg-gray-50 border rounded-[20px] flex items-center justify-between cursor-pointer transition-all',
                        isCategoryOpen ? 'border-orange-500 ring-2 ring-orange-500/10' : 'border-gray-200',
                    )}
                >
                <span className={cn('text-sm', selectedCategory ? 'text-gray-900 font-bold' : 'text-gray-400')}>
                  {selectedCategory || 'Select a category'}
                </span>
                  <ChevronDown size={18} className={cn('transition-transform', isCategoryOpen && 'rotate-180')} />
                </div>

                {isCategoryOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-[24px] shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            autoFocus
                            placeholder="Search categories..."
                            className="w-full pl-9 pr-4 py-3 bg-gray-50 rounded-xl text-xs outline-none border border-transparent focus:border-orange-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat: string) => (
                                <div
                                    key={cat}
                                    onClick={() => { setValue('category', cat); setIsCategoryOpen(false); setSearchQuery(''); }}
                                    className="flex items-center justify-between p-3 hover:bg-orange-50 rounded-xl cursor-pointer transition-colors group"
                                >
                                  <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">{cat}</span>
                                  {selectedCategory === cat && <Check size={14} className="text-orange-500" />}
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-4 text-xs text-gray-400 font-bold uppercase tracking-widest">No categories found</p>
                        )}
                      </div>
                    </div>
                )}
              </div>
            </FormField>

            <FormField label="Price (₦)" error={errors.price?.message as string}>
              <StyledInput {...register('price')} type="number" placeholder="5000" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Product Stock" error={errors.stock?.message as string}>
              <StyledInput {...register('stock')} type="number" placeholder="1" />
            </FormField>
            <FormField label="Product Size (optional)" error={errors.size?.message as string}>
              <StyledInput {...register('size')} placeholder="e.g. sm, lg, xlg, 42ft" />
            </FormField>
          </div>

          <FormField label="Product Description" error={errors.description?.message as string}>
          <textarea
              {...register('description')}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[24px] h-32 resize-none outline-none focus:border-orange-500 transition-all text-sm"
              placeholder="Describe your product materials, size, etc."
          />
          </FormField>
        </div>

        {/* ── SECTION 2: Escrow & Delivery ───────────────── */}
        <div className="space-y-5">
          <SectionHeader label="Escrow & Delivery" />

          {/* Explainer pill */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <ShieldCheck size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Your product uses <strong>Payluk Escrow</strong> — payment is held securely until you confirm delivery,
              protecting both you and the buyer.
            </p>
          </div>

          {/* Who Pays */}
          <FormField label="Who pays the platform fee?" error={errors.whoPays?.message as string}>
            <div className="grid grid-cols-3 gap-2">
              {WHO_PAYS_OPTIONS.map(opt => (
                  <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('whoPays', opt.value)}
                      className={cn(
                          'flex flex-col items-center text-center gap-1 p-3 rounded-2xl border-2 transition-all text-xs font-bold',
                          selectedWhoPays === opt.value
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-white',
                      )}
                  >
                    <span className="font-black text-[13px]">{opt.label}</span>
                    <span className={cn('font-medium leading-tight', selectedWhoPays === opt.value ? 'text-orange-500' : 'text-gray-400')}>
                  {opt.description}
                </span>
                  </button>
              ))}
            </div>
          </FormField>

          {/* Delivery Window */}
          <FormField label="Delivery window" error={errors.maxDelivery?.message as string}>
            <div className="flex gap-3 items-start">
              {/* Number input */}
              <div className="w-28 flex-shrink-0">
                <div className="relative">
                  <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                      {...register('maxDelivery')}
                      type="number"
                      min={1}
                      placeholder="3"
                      className="w-full pl-8 pr-3 py-4 bg-gray-50 border border-gray-200 rounded-[20px] text-sm font-bold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Timeline pill selector */}
              <div className="flex gap-2 flex-1">
                {TIMELINE_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue('deliveryTimeline', opt.value)}
                        className={cn(
                            'flex-1 py-4 rounded-[20px] border-2 text-xs font-black transition-all',
                            selectedTimeline === opt.value
                                ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200'
                                : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-white',
                        )}
                    >
                      {opt.label}
                    </button>
                ))}
              </div>
            </div>

            {/* Live preview */}
            {watch('maxDelivery') && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 font-medium ml-1">
                  <Clock size={12} />
                  Buyer expects delivery within{' '}
                  <span className="font-black text-gray-600">
                {watch('maxDelivery')} {selectedTimeline}
              </span>
                </p>
            )}
          </FormField>
        </div>

        {/* ── SECTION 3: Media Gallery ────────────────────── */}
        <section>
          <label className="text-sm font-bold text-gray-700 ml-1">Product Media</label>
          <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[28px] bg-gray-50/50 hover:bg-orange-50/50 hover:border-orange-200 cursor-pointer transition-all">
            <Upload className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-xs font-bold text-gray-500">Add Photos/Video</span>
            <input type="file" className="hidden" multiple onChange={handleFileChange} accept="image/*,video/*" />
          </label>
          <MediaPreview files={media} onRemove={(index) => setMedia(media.filter((_, i) => i !== index))} />
        </section>

        {/* ── SECTION 4: Publish to Feed Toggle ──────────── */}
        <div className={`p-6 rounded-[32px] border transition-all ${makePost ? 'bg-orange-50/50 border-orange-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${makePost ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <Megaphone size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">Announce to Feed?</p>
                <p className="text-xs text-gray-500 font-medium">Create a social post automatically</p>
              </div>
            </div>
            <button
                type="button"
                onClick={() => setMakePost(!makePost)}
                className={`w-12 h-6 rounded-full transition-colors relative ${makePost ? 'bg-orange-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${makePost ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {makePost && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <FormField label="Post Caption (Required)" error={errors.caption?.message as string}>
              <textarea
                  {...register('caption')}
                  className="w-full p-4 bg-white border border-orange-200 rounded-2xl h-24 resize-none outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Write a catchy announcement for your followers..."
              />
                </FormField>
                <FormField label="Post Tags">
                  <TagInput tags={tags} setTags={setTags} tagInput={tagInput} setTagInput={setTagInput} />
                </FormField>
              </div>
          )}
        </div>

        {/* ── Submit ─────────────────────────────────────── */}
        <button
            type="submit"
            disabled={isPending}
            className="w-full py-5 bg-gray-900 text-white rounded-[28px] font-black text-lg hover:bg-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:bg-gray-400 shadow-xl shadow-gray-200"
        >
          {isPending ? (
              <Loader2 className="animate-spin" />
          ) : (
              <>
                <span>{makePost ? 'Upload & Share to Feed' : 'Save Product Only'}</span>
                {makePost ? <Sparkles size={20} className="text-orange-500" /> : <Archive size={20} className="text-gray-400" />}
              </>
          )}
        </button>
      </form>
  );
};

// ─── Small helper so section headers are DRY ────────────────
const SectionHeader = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2 mb-2">
      <div className="h-8 w-1 bg-orange-500 rounded-full" />
      <h3 className="font-black text-gray-900 uppercase tracking-wider text-sm">{label}</h3>
    </div>
);

export default UploadProductForm;