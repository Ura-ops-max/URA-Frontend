// src/components/WriteReviewForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Loader2, MessageSquarePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useReviews } from '@/hooks/api/use-reviews';
import { motion } from 'framer-motion';

const reviewFormSchema = z.object({
    rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
    comment: z.string().max(500, 'Comment cannot exceed 500 characters').optional(),
});

type ReviewFormInputs = z.infer<typeof reviewFormSchema>;

interface WriteReviewFormProps {
    itemId: string;
    itemModel: 'Business' | 'Product';
    initialData?: { _id: string; rating: number; comment: string }; // Add this
    onReviewSubmitted: () => void;
    onClose: () => void;
}

const WriteReviewForm: React.FC<WriteReviewFormProps> = ({ itemId, itemModel, initialData, onReviewSubmitted, onClose }) => {
    const isEditMode = !!initialData;
    const { addReview, editReview } = useReviews(itemId);
    const [currentRating, setCurrentRating] = useState(initialData?.rating || 0);
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ReviewFormInputs>({
        resolver: zodResolver(reviewFormSchema),
        defaultValues: {
            rating: initialData?.rating || 0,
            comment: initialData?.comment || '',
        },
    });

    // 2. IMPORTANT: Update form if initialData changes (e.g., clicking edit on a different card)
    useEffect(() => {
        if (initialData) {
            reset({
                rating: initialData.rating,
                comment: initialData.comment
            });
            setCurrentRating(initialData.rating);
        } else {
            reset({ rating: 0, comment: '' });
            setCurrentRating(0);
        }
    }, [initialData, reset]);

    // Set the rating value in the form and update local state
    const handleRatingClick = (val: number) => {
        setCurrentRating(val);
        setValue('rating', val); // Update the form value so it's ready for submission
    };



    // Inside WriteReviewForm.tsx
    const onSubmit = async (data: any) => {
        const payload = {
            ...data,
            rating: currentRating, // Ensure we use the latest star state
            reviewedItem: itemId,
            reviewedItemModel: itemModel
        };

        const result = isEditMode && initialData
            ? await editReview(initialData._id, payload)
            : await addReview(payload);

        if (result.success) {
            onReviewSubmitted();
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-8 pt-4 pb-32 md:pb-12 space-y-8 select-none"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-xl text-[#FF6B35]">
                        <MessageSquarePlus size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Share Experience</h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Help others by being honest</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-400" />
                </button>
            </div>

            {/* Star Selection with Feedback */}
            <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Your Rating</Label>
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                            <motion.button
                                type="button"
                                key={starValue}
                                whileTap={{ scale: 0.8 }}
                                onClick={() => handleRatingClick(starValue)}
                            >
                                <Star
                                    size={38}
                                    className={cn(
                                        'transition-all duration-300',
                                        currentRating >= starValue ? 'text-[#FF6B35] fill-[#FF6B35]' : 'text-gray-200'
                                    )}
                                />
                            </motion.button>
                        ))}
                    </div>
                    <span className="text-xl font-black text-gray-900 pr-2">
                        {currentRating > 0 ? `${currentRating}.0` : '--'}
                    </span>
                </div>
            </div>

            {/* Modern Input */}
            <div className="space-y-3">
                <Label htmlFor="comment" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Review Message</Label>
                <textarea
                    id="comment"
                    placeholder="What did you love? Any room for improvement?"
                    rows={4}
                    {...register('comment')}
                    className={cn(
                        "w-full rounded-3xl border-2 border-gray-100 bg-white px-5 py-4 text-gray-800 font-medium placeholder:text-gray-300 focus:outline-none focus:border-[#FF6B35] transition-all resize-none shadow-sm",
                        errors.comment && "border-red-500"
                    )}
                />
            </div>

            {/* Primary Action */}
            <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                    type="submit"
                    disabled={isSubmitting || currentRating === 0}
                    className="w-full h-16 bg-gray-900 hover:bg-black text-white rounded-3xl font-black text-lg transition-all shadow-xl shadow-gray-200"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : (isEditMode ? 'Update Review' : 'Publish Review')}
                </Button>
            </motion.div>
        </form>
    );
};

export default WriteReviewForm;