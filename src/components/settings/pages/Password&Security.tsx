import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, AlertCircle, Loader2, CheckCircle2, Edit3 } from 'lucide-react';
import { useAuthContext } from '@/context/auth-provider';
import { useUserSettings } from '@/hooks/api/use-user-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Password Schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function PasswordSecurity() {
  const { user } = useAuthContext();
  const { updatePassword, updateEmail, resendVerification } = useUserSettings();

  // --- EMAIL EDIT STATES ---
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailAuthPassword, setEmailAuthPassword] = useState('');

  // --- PASSWORD FORM ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = (data: any) => {
    updatePassword.mutate(data, { onSuccess: () => reset() });
  };

  // --- EMAIL SUBMIT HANDLER ---
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmail.mutate(
      { newEmail, password: emailAuthPassword },
      {
        onSuccess: () => {
          setIsEditingEmail(false);
          setNewEmail('');
          setEmailAuthPassword('');
        },
      },
    );
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* 1. EMAIL SECTION */}
      <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Email Address</h2>
              <p className="text-xs text-gray-500">Manage your account email and verification</p>
            </div>
          </div>

          {/* Toggle Button */}
          {!isEditingEmail && (
            <Button
              variant="ghost"
              onClick={() => setIsEditingEmail(true)}
              className="rounded-xl text-orange-600 font-bold text-xs gap-2 hover:bg-orange-50"
            >
              <Edit3 size={14} /> Change
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {!isEditingEmail ? (
            /* VIEW MODE */
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {user?.emailVerified ? (
                    <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                      <AlertCircle size={12} /> Unverified
                    </span>
                  )}
                </div>
              </div>
              {!user?.emailVerified && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold"
                  onClick={() => resendVerification.mutate()}
                  disabled={resendVerification.isPending}
                >
                  {resendVerification.isPending ? 'Sending...' : 'Verify Now'}
                </Button>
              )}
            </div>
          ) : (
            /* EDIT MODE */
            <form
              onSubmit={handleEmailSubmit}
              className="space-y-4 animate-in fade-in slide-in-from-top-2"
            >
              <div className="grid gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                    New Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter your new email"
                    className="rounded-2xl bg-gray-50 border-none focus-visible:ring-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                    Confirm with Password
                  </label>
                  <Input
                    type="password"
                    required
                    value={emailAuthPassword}
                    onChange={(e) => setEmailAuthPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="rounded-2xl bg-gray-50 border-none focus-visible:ring-orange-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={updateEmail.isPending}
                  className="rounded-xl bg-gray-900 hover:bg-orange-600 font-bold px-6"
                >
                  {updateEmail.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    'Save Email'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditingEmail(false)}
                  className="rounded-xl font-bold text-gray-400"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* 2. PASSWORD SECTION (Your existing code) */}
      <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-500">Keep your account secure with a strong password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
          {/* ... rest of your password form fields ... */}
          <div className="grid gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Current Password</label>
              <Input
                type="password"
                {...register('currentPassword')}
                className="rounded-2xl bg-gray-50 border-none focus-visible:ring-orange-500"
              />
              {errors.currentPassword && (
                <p className="text-[10px] text-red-500 font-medium ml-1">
                  {errors.currentPassword.message as string}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">New Password</label>
                <Input
                  type="password"
                  {...register('newPassword')}
                  className="rounded-2xl bg-gray-50 border-none focus-visible:ring-orange-500"
                />
                {errors.newPassword && (
                  <p className="text-[10px] text-red-500 font-medium ml-1">
                    {errors.newPassword.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">Confirm New Password</label>
                <Input
                  type="password"
                  {...register('confirmPassword')}
                  className="rounded-2xl bg-gray-50 border-none focus-visible:ring-orange-500"
                />
                {errors.confirmPassword && (
                  <p className="text-[10px] text-red-500 font-medium ml-1">
                    {errors.confirmPassword.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full md:w-fit rounded-2xl px-8 bg-gray-900 hover:bg-orange-600 text-white font-bold transition-all"
            disabled={updatePassword.isPending}
          >
            {updatePassword.isPending && <Loader2 className="mr-2 animate-spin" size={16} />}
            Update Password
          </Button>
        </form>
      </section>
    </div>
  );
}
