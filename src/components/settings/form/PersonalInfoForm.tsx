import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Save, Loader2, User, Lock, MapPin } from 'lucide-react';
import { useAuthContext } from '@/context/auth-provider';
import BusinessWarningModal from '../ui/BusinessWarningModal';
import { useUpdateProfile, useUpdateShippingAddress } from '@/hooks/api/use-user-profile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner'; // Assuming you use sonner based on your main.tsx
import { z } from 'zod';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  bio: z.string().max(160, 'Bio cannot exceed 160 characters').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const shippingSchema = z.object({
  shippingPhone: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingFullAddress: z.string().optional(),
});
type ShippingFormValues = z.infer<typeof shippingSchema>;

const PersonalInfoForm: React.FC = () => {
  const { user } = useAuthContext();
  const { mutate, isPending } = useUpdateProfile();
  const { mutate: saveShipping, isPending: isSavingShipping } = useUpdateShippingAddress();
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
    },
  });

  // Shipping form
  const {
    register: registerShipping,
    handleSubmit: handleShippingSubmit,
    reset: resetShipping,
    formState: { errors: shippingErrors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      shippingPhone: user?.shippingAddress?.phone ?? user?.phone ?? '',
      shippingCity: user?.shippingAddress?.city ?? '',
      shippingFullAddress: user?.shippingAddress?.fullAddress ?? '',
    },
  });

  // `defaultValues` are only read once, but `user` arrives asynchronously — so
  // without this the form stays on the empty initial values and edits look
  // like they never saved. Re-sync whenever the user data changes.
  useEffect(() => {
    if (!user) return;
    reset({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
    });
    resetShipping({
      shippingPhone: user.shippingAddress?.phone ?? user.phone ?? '',
      shippingCity: user.shippingAddress?.city ?? '',
      shippingFullAddress: user.shippingAddress?.fullAddress ?? '',
    });
  }, [user, reset, resetShipping]);

  const onShippingSubmit = (data: ShippingFormValues) => {
    saveShipping({
      phone: data.shippingPhone,
      city: data.shippingCity,
      fullAddress: data.shippingFullAddress,
    });
  };

  // 1. Store Previews (for UI) AND actual Files (for Upload)
  const [previews, setPreviews] = useState({
    profilePicture: user?.profilePicture || null,
    coverPicture: user?.coverPicture || null, // Ensure this matches your user object key
  });

  const [files, setFiles] = useState<{ profilePicture: File | null; coverPicture: File | null }>({
    profilePicture: null,
    coverPicture: null,
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'profilePicture' | 'coverPicture',
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Frontend Validation: Size check (e.g., 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Image must be less than 5MB');
      }

      setFiles((prev) => ({ ...prev, [type]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    mutate({
      ...data,
      profilePicture: files.profilePicture,
      coverPicture: files.coverPicture,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-gray-100">
      {/* Header Section */}
      <div className="p-6 md:p-10 space-y-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Profile Identity</h3>
          <p className="text-sm text-gray-500">Update your photos and personal details.</p>
        </div>

        {/* Cover Photo */}
        <div className="relative group h-48 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
          {previews.coverPicture ? (
            <img src={previews.coverPicture} className="w-full h-full object-cover" alt="Cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No cover photo set
            </div>
          )}
          <label className="absolute bottom-4 right-4 bg-white/90 backdrop-blur shadow-sm px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-white transition flex items-center gap-2">
            <ImageIcon size={16} /> Change Cover
            <input
              type="file"
              name="coverPicture"
              hidden
              onChange={(e) => handleFileChange(e, 'coverPicture')}
              accept="image/*"
            />
          </label>
        </div>

        {/* Profile Picture */}
        <div className="flex items-end gap-6 -mt-16 ml-8 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-gray-200 overflow-hidden">
              {previews.profilePicture ? (
                <img
                  src={previews.profilePicture}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <User size={40} className="text-gray-500" />
                </div>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
              <Camera className="text-white" size={24} />
              <input
                type="file"
                name="profilePicture"
                hidden
                onChange={(e) => handleFileChange(e, 'profilePicture')}
                accept="image/*"
              />
            </label>
          </div>
          <div className="mb-4">
            <h4 className="font-bold text-gray-900">Profile Picture</h4>
            <p className="text-xs text-gray-500">Recommended: 400x400px</p>
          </div>
        </div>
      </div>

      {/* Editable Fields - Added 'name' attributes for FormData */}
      {/* Basic Information + Bio */}
      <div className="p-6 md:p-10">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
          Basic Information
        </h4>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">First Name</label>
              <input
                {...register('firstName')}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border outline-none transition-all',
                  errors.firstName
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 focus:border-orange-500',
                )}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 font-medium">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Last Name</label>
              <input
                {...register('lastName')}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border outline-none transition-all',
                  errors.lastName
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 focus:border-orange-500',
                )}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 font-medium">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Bio</label>
            <textarea
              {...register('bio')}
              rows={4}
              className={cn(
                'w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none',
                errors.bio ? 'border-red-500' : 'border-gray-200 focus:border-orange-500',
              )}
            />
            <div className="flex justify-between">
              {errors.bio ? (
                <p className="text-xs text-red-500 font-medium">{errors.bio.message}</p>
              ) : (
                <p className="text-xs text-gray-400">Brief description for your profile.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Shipping Address Section ─────────────────────────── */}
      <div className="p-6 md:p-10 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <MapPin size={16} className="text-orange-500" />
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Default Shipping Address
          </h4>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          This will be pre-filled at checkout. You can always edit it before placing an order.
        </p>
        <form onSubmit={handleShippingSubmit(onShippingSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Phone Number</label>
              <input
                {...registerShipping('shippingPhone')}
                placeholder="+2348012345678"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border outline-none transition-all',
                  shippingErrors.shippingPhone
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 focus:border-orange-500',
                )}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">City</label>
              <input
                {...registerShipping('shippingCity')}
                placeholder="Lagos"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border outline-none transition-all',
                  shippingErrors.shippingCity
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 focus:border-orange-500',
                )}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">Street Address</label>
              <input
                {...registerShipping('shippingFullAddress')}
                placeholder="123 Business Way, Ikeja"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border outline-none transition-all',
                  shippingErrors.shippingFullAddress
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 focus:border-orange-500',
                )}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingShipping}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait text-sm"
            >
              {isSavingShipping ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Address
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Read-Only Account Section */}
      <div className="p-6 md:p-10 bg-gray-50/50">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Lock size={14} /> Account Credentials
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
            <div className="px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed flex justify-between items-center">
              <span>@{user?.username}</span>
              <Lock size={14} className="opacity-50" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
            <div className="px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed flex justify-between items-center">
              <span>{user?.email}</span>
              <Lock size={14} className="opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Business Conversion */}
      {!user?.isBusinessOwner && (
        <div className="p-6 md:p-10">
          <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-orange-900 text-lg">Are you a Business?</h4>
              <p className="text-orange-700 text-sm">
                Sell products, get reviewed, and access business insights.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBusinessModal(true)}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition"
            >
              Convert to Business
            </button>
          </div>
        </div>
      )}

      {/* Submit Section */}
      {/* Submit Button (Updates automatically based on isPending) */}
      <div className="p-8 bg-gray-50/50 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Personal Info
            </>
          )}
        </button>
      </div>
      {showBusinessModal && <BusinessWarningModal onClose={() => setShowBusinessModal(false)} />}
    </form>
  );
};

export default PersonalInfoForm;
