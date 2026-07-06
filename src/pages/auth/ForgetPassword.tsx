import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { forgotPasswordMutationFn } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      await forgotPasswordMutationFn(data.email);
      setIsSubmitted(true);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // SUCCESS STATE: Shown after the user clicks the button
  if (isSubmitted) {
    return (
      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700 text-center lg:text-left">
        <div className="flex justify-center lg:justify-start mb-6">
          <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center text-[#FF6B35]">
            <MailCheck size={32} />
          </div>
        </div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Check your email</h2>
        <p className="mt-4 text-gray-500 font-medium leading-relaxed">
          We've sent a password reset link to your email address. Please follow the instructions to
          reset your password.
        </p>
        <div className="mt-10">
          <Link to="/auth/login">
            <Button className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black text-lg transition-all">
              Return to login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // FORM STATE
  return (
    <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Recover Password</h2>
        <p className="mt-3 text-gray-500 font-medium text-sm">
          No worries! Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className={cn(
              'text-[10px] font-black uppercase tracking-widest ml-1 transition-colors',
              errors.email ? 'text-red-500' : 'text-gray-400',
            )}
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g. name@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Please enter a valid email',
              },
            })}
            disabled={isLoading}
            className={cn(
              'h-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all',
              errors.email && 'border-red-500 ring-red-50',
            )}
          />
          {errors.email && (
            <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-[#FF6B35] hover:bg-[#e85a20] text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-100 transition-all active:scale-[0.98]"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
        </Button>

        <div className="pt-4 text-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-[#FF6B35] transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
