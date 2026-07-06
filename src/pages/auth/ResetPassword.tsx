import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPasswordMutationFn } from '@/lib/api';

type FormValues = { password: string; confirm: string };

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [show, setShow] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { password: '', confirm: '' } });

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast.error('This reset link is invalid or incomplete.');
      return;
    }
    setIsLoading(true);
    try {
      await resetPasswordMutationFn({ token, password: data.password });
      setDone(true);
      toast.success('Password reset successful.');
      setTimeout(() => navigate('/auth/login', { replace: true }), 1800);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'This reset link is invalid or has expired.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFB] px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="mt-6 text-xl font-bold text-gray-900">Password updated</h1>
          <p className="mt-2 text-sm text-gray-500">Redirecting you to sign in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFB] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Set a new password</h1>
        <p className="mt-2 text-sm text-gray-500">Choose a strong password you haven&apos;t used before.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">New password</label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-12 rounded-xl pl-10 pr-10"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                })}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Confirm password</label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-12 rounded-xl pl-10"
                {...register('confirm', {
                  required: 'Please confirm your password',
                  validate: (v) => v === watch('password') || 'Passwords do not match',
                })}
              />
            </div>
            {errors.confirm && (
              <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.confirm.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-[#FF6B35] text-base font-bold text-white hover:bg-[#e85a20]"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset password'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
