import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '@/hooks/api/use-auth-mutations';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUsernameCheck } from '@/hooks/api/use-username-check';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/shared/PasswordInput';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{6,}$/;
const PASSWORD_MESSAGE =
  'Password must be at least 6 characters with uppercase, lowercase, number, and special character.';
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const USERNAME_MESSAGE = 'Username can only contain letters, numbers, and underscores';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .regex(USERNAME_REGEX, USERNAME_MESSAGE),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .regex(/^0[789][01]\d{8}$/, 'Enter a valid Nigerian phone number (e.g., 08012345678)'),
    password: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [globalError, setGlobalError] = useState('');

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const { mutate: register, isPending } = useRegister({ setError, setGlobalError });

  const usernameValue = watch('username') || '';
  const shouldCheckUsername = usernameValue.length >= 3 && !errors.username;

  const { isChecking, isAvailable, isTakenError, isValidationError } = useUsernameCheck(
    shouldCheckUsername ? usernameValue : '',
  );

  const apiErrorMessage = isValidationError || isTakenError;

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...payload } = data;
    register(payload);
  };

  return (
    <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Sign Up</h2>
        <p className="mt-3 text-gray-500 font-medium text-sm">
          Get started with URA and unlock a world of possibilities.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Global Error Alert */}
        {globalError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-[11px] font-bold animate-in zoom-in-95">
            {globalError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              className={cn(
                'text-[10px] font-black uppercase tracking-widest ml-1 transition-colors',
                errors.firstName ? 'text-red-500' : 'text-gray-400',
              )}
            >
              First Name
            </Label>
            <Input
              {...registerField('firstName')}
              placeholder="Binta"
              className={cn(
                'h-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all',
                errors.firstName && 'border-red-500 ring-red-50',
              )}
            />
            {errors.firstName && (
              <p className="text-[10px] text-red-500 font-bold ml-1">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label
              className={cn(
                'text-[10px] font-black uppercase tracking-widest ml-1 transition-colors',
                errors.lastName ? 'text-red-500' : 'text-gray-400',
              )}
            >
              Last Name
            </Label>
            <Input
              {...registerField('lastName')}
              placeholder="Yusuf"
              className={cn(
                'h-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all',
                errors.lastName && 'border-red-500 ring-red-50',
              )}
            />
            {errors.lastName && (
              <p className="text-[10px] text-red-500 font-bold ml-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            className={cn(
              'text-[10px] font-black uppercase tracking-widest ml-1 transition-colors',
              errors.username || apiErrorMessage ? 'text-red-500' : 'text-gray-400',
            )}
          >
            Username
          </Label>
          <div className="relative">
            <Input
              {...registerField('username')}
              placeholder="bintabespoke"
              className={cn(
                'h-12 rounded-2xl border-gray-200 bg-gray-50/50 pr-10',
                isAvailable === false || errors.username
                  ? 'border-red-500'
                  : isAvailable === true && shouldCheckUsername
                    ? 'border-green-500'
                    : '',
              )}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isChecking && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
              {!isChecking && isAvailable === true && shouldCheckUsername && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              {!isChecking &&
                (isAvailable === false || (errors.username && usernameValue.length >= 3)) && (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
            </div>
          </div>
          {errors.username && (
            <p className="text-[10px] text-red-500 font-bold ml-1">{errors.username.message}</p>
          )}
          {!errors.username && apiErrorMessage && (
            <p className="text-[10px] text-red-500 font-bold ml-1">{apiErrorMessage}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            className={cn(
              'text-[10px] font-black uppercase tracking-widest ml-1 transition-colors',
              errors.email ? 'text-red-500' : 'text-gray-400',
            )}
          >
            Email Address
          </Label>
          <Input
            {...registerField('email')}
            placeholder="bintabespoke@gmail.com"
            className={cn(
              'h-12 rounded-2xl border-gray-200 bg-gray-50/50',
              errors.email && 'border-red-500',
            )}
          />
          {errors.email && (
            <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>
          )}

          <div className="space-y-1.5">
            <Label
              className={cn(
                'text-[10px] font-black uppercase tracking-widest ml-1',
                errors.phone ? 'text-red-500' : 'text-gray-400',
              )}
            >
              Phone Number
            </Label>
            <Input
              {...registerField('phone')}
              placeholder="08012345678"
              className={cn(
                'h-12 rounded-2xl border-gray-200 bg-gray-50/50',
                errors.phone && 'border-red-500',
              )}
            />
            {errors.phone && (
              <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              className={cn(
                'text-[10px] font-black uppercase tracking-widest ml-1 transition-colors',
                errors.password ? 'text-red-500' : 'text-gray-400',
              )}
            >
              Password
            </Label>
            <PasswordInput
              {...registerField('password')}
              className={cn(
                'h-12 rounded-2xl border-gray-200 bg-gray-50/50',
                errors.password && 'border-red-500',
              )}
            />
            {errors.password && (
              <p className="text-[10px] text-red-500 font-bold ml-1 leading-tight">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label
              className={cn(
                'text-[10px] font-black uppercase tracking-widest ml-1 transition-colors',
                errors.confirmPassword ? 'text-red-500' : 'text-gray-400',
              )}
            >
              Confirm
            </Label>
            <PasswordInput
              {...registerField('confirmPassword')}
              className={cn(
                'h-12 rounded-2xl border-gray-200 bg-gray-50/50',
                errors.confirmPassword && 'border-red-500',
              )}
            />
            {errors.confirmPassword && (
              <p className="text-[10px] text-red-500 font-bold ml-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-14 bg-[#FF6B35] hover:bg-[#e85a20] text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-100 mt-2 transition-all active:scale-[0.98]"
        >
          {isPending ? <Loader2 className="animate-spin" /> : 'Continue'}
        </Button>

        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-gray-300">
            <span className="bg-white px-4">Or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_API_ROOT_URL}/api/v1/auth/google`;
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="0.98em"
              height="1em"
              viewBox="0 0 256 262"
            >
              <path
                fill="#4285f4"
                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
              ></path>
              <path
                fill="#34a853"
                d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
              ></path>
              <path
                fill="#fbbc05"
                d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
              ></path>
              <path
                fill="#eb4335"
                d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
              ></path>
            </svg>
            <span>Google</span>
          </Button>
          <Button type="button" variant="outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256">
              <path fill="#f1511b" d="M121.666 121.666H0V0h121.666z"></path>
              <path fill="#80cc28" d="M256 121.666H134.335V0H256z"></path>
              <path fill="#00adef" d="M121.663 256.002H0V134.336h121.663z"></path>
              <path fill="#fbbc09" d="M256 256.002H134.335V134.336H256z"></path>
            </svg>
            <span>Microsoft</span>
          </Button>
        </div>

        <p className="mt-6 text-center text-sm font-medium text-gray-500">
          Already have an account?
          <Link
            to="/auth/login"
            className="ml-1 text-[#FF6B35] font-black hover:underline underline-offset-4"
          >
            Sign In
          </Link>
        </p>

        <p className="text-center text-[11px] text-gray-400 mt-4 px-4 leading-relaxed">
          By signing up you agree to our{' '}
          <Link to="/privacy" className="underline hover:text-gray-600 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </form>
    </div>
  );
}
