import React, { useState, useEffect } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Globe,
  Save,
  Loader2,
  Camera,
  Image as ImageIcon,
  Clock,
  X,
} from 'lucide-react';
import { useAuthContext } from '@/context/auth-provider';
import { useUserProfile } from '@/hooks/api/use-user-profile';
import { useUpdateBusiness } from '@/hooks/api/use-user-profile';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BusinessInfoForm: React.FC = () => {
  const { user } = useAuthContext();
  const { data: profile, isLoading } = useUserProfile(user?._id, false);
  const { mutate, isPending } = useUpdateBusiness();

  const business = profile?.business;

  // 1. Image & File States
  const [previews, setPreviews] = useState({ businessLogo: '', businessCover: '' });
  const [files, setFiles] = useState<{ businessLogo: File | null; businessCover: File | null }>({
    businessLogo: null,
    businessCover: null,
  });

  // Track if user explicitly wants to delete an existing image
  const [deleteFlags, setDeleteFlags] = useState({ logo: false, cover: false });

  // 2. Operating Hours State
  const [hours, setHours] = useState(() =>
    daysOfWeek.map((d) => ({ day: d, open: '09:00', close: '17:00', isClosed: false })),
  );

  // Sync Data when profile loads
  useEffect(() => {
    if (business) {
      setPreviews({
        businessLogo: business.businessLogo || '',
        businessCover: business.businessCover || '',
      });

      if (business.operatingHours && business.operatingHours.length > 0) {
        const syncedHours = business.operatingHours.map((h: any) => ({
          ...h,
          isClosed: h.open === 'Closed' || h.close === 'Closed',
          open: h.open === 'Closed' ? '09:00' : h.open,
          close: h.close === 'Closed' ? '17:00' : h.close,
        }));
        setHours(syncedHours);
      }
    }
  }, [business]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'businessLogo' | 'businessCover',
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [type]: file }));
      setDeleteFlags((prev) => ({ ...prev, [type === 'businessLogo' ? 'logo' : 'cover']: false }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (type: 'businessLogo' | 'businessCover') => {
    setPreviews((prev) => ({ ...prev, [type]: '' }));
    setFiles((prev) => ({ ...prev, [type]: null }));
    setDeleteFlags((prev) => ({ ...prev, [type === 'businessLogo' ? 'logo' : 'cover']: true }));
  };

  const handleHourChange = (day: string, field: 'open' | 'close' | 'isClosed', value: any) => {
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, [field]: value } : h)));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const formattedHours = hours.map(({ day, open, close, isClosed }) => ({
      day,
      open: isClosed ? 'Closed' : open,
      close: isClosed ? 'Closed' : close,
    }));

    // Construct Payload
    const payload: any = {
      businessName: data.businessName as string,
      category: data.category as string,
      about: data.about as string,
      phone: data.phone as string,
      website: data.website as string,
      fullAddress: data.fullAddress as string,
      operatingHours: formattedHours,
    };

    // LOGIC: Image Handling
    // 1. If Delete flag is true, tell backend to remove it
    // 2. Else if there is a new File, send the file
    // 3. Otherwise, don't include the key at all (Backend will keep existing)
    if (deleteFlags.logo) payload.businessLogo = 'DELETE_IMAGE';
    else if (files.businessLogo) payload.businessLogo = files.businessLogo;

    if (deleteFlags.cover) payload.businessCover = 'DELETE_IMAGE';
    else if (files.businessCover) payload.businessCover = files.businessCover;

    mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Loading business details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="divide-y divide-gray-100 overflow-x-hidden">
      {/* 1. Visual Branding Section */}
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
            <Store size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Business Branding</h3>
            <p className="text-sm text-gray-500">How your business appears to customers.</p>
          </div>
        </div>

        {/* Business Cover Photo */}
        <div className="relative group h-48 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
          {previews.businessCover ? (
            <>
              <img
                src={previews.businessCover}
                className="w-full h-full object-cover"
                alt="Cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage('businessCover')}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No cover photo set
            </div>
          )}
          <label className="absolute bottom-3 right-3 bg-white/90 backdrop-blur shadow-sm px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-white transition flex items-center gap-2 border border-gray-200">
            <ImageIcon size={14} /> Change Cover
            <input
              type="file"
              hidden
              onChange={(e) => handleFileChange(e, 'businessCover')}
              accept="image/*"
            />
          </label>
        </div>

        {/* Business Logo */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-md bg-gray-100 overflow-hidden">
              {previews.businessLogo ? (
                <img
                  src={previews.businessLogo}
                  className="w-full h-full object-cover"
                  alt="Logo"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store size={32} className="text-gray-300" />
                </div>
              )}
            </div>
            {previews.businessLogo && (
              <button
                type="button"
                onClick={() => handleRemoveImage('businessLogo')}
                className="absolute -top-2 -left-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg border-2 border-white"
              >
                <X size={12} />
              </button>
            )}
            <label className="absolute -bottom-2 -right-2 p-2.5 bg-orange-500 rounded-xl text-white cursor-pointer hover:bg-orange-600 transition shadow-lg">
              <Camera size={18} />
              <input
                type="file"
                hidden
                onChange={(e) => handleFileChange(e, 'businessLogo')}
                accept="image/*"
              />
            </label>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900">Store Logo</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
              Use a square logo for best visibility in searches.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Identity Section */}
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Business Name</label>
            <input
              name="businessName"
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500"
              defaultValue={business?.businessName}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Category</label>
            <select
              name="category"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-500"
              defaultValue={business?.category}
            >
              <option value="Restaurant">Restaurant</option>
              <option value="Retail">Retail</option>
              <option value="Services">Services</option>
              <option value="Technology">Technology</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-700">About the Business</label>
            <textarea
              name="about"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              defaultValue={business?.about}
            />
          </div>
        </div>
      </div>

      {/* 3. Contact Section */}
      <div className="p-8 space-y-6 bg-gray-50/40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Phone size={14} className="text-orange-500" /> Phone
            </label>
            <input
              name="phone"
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
              defaultValue={business?.contact?.phone}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Globe size={14} className="text-orange-500" /> Website
            </label>
            <input
              name="website"
              type="url"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
              defaultValue={business?.contact?.website}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <MapPin size={14} className="text-orange-500" /> Full Address
            </label>
            <input
              name="fullAddress"
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
              defaultValue={business?.address?.fullAddress}
            />
          </div>
        </div>
      </div>

      {/* 4. Operating Hours */}
      <div className="p-8 space-y-6">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Clock size={16} /> Operating Hours
        </h4>
        <div className="space-y-3">
          {hours.map((dayData) => (
            <div
              key={dayData.day}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white border border-gray-100 gap-4 shadow-sm"
            >
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <span className="text-sm font-bold text-gray-700 w-24">{dayData.day}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!dayData.isClosed}
                    onChange={() => handleHourChange(dayData.day, 'isClosed', !dayData.isClosed)}
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-orange-500 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  <span className="ml-3 text-xs font-semibold text-gray-500">
                    {dayData.isClosed ? 'Closed' : 'Open'}
                  </span>
                </label>
              </div>
              <div
                className={`flex items-center gap-3 transition-opacity ${dayData.isClosed ? 'opacity-25 pointer-events-none' : 'opacity-100'}`}
              >
                <input
                  type="time"
                  value={dayData.open}
                  onChange={(e) => handleHourChange(dayData.day, 'open', e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
                />
                <span className="text-gray-300 text-xs font-black">TO</span>
                <input
                  type="time"
                  value={dayData.close}
                  onChange={(e) => handleHourChange(dayData.day, 'close', e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 bg-gray-50 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bg-orange-500 text-white px-10 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Business Changes
        </button>
      </div>
    </form>
  );
};

export default BusinessInfoForm;
