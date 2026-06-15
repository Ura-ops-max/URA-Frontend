import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useLogin } from '@/hooks/api/use-auth-mutations';
import { AlertCircle, Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/shared/PasswordInput';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  // Extract server-side state from mutation
  const { mutate: login, isPending, error: serverError } = useLogin();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = (data: any) => {
    login(data);
  };

  // Extract the error message from the Axios error object safely
  const errorMessage = (serverError as any)?.response?.data?.message;

  return (
    <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Sign In</h2>
        <p className="mt-3 text-gray-500 font-medium text-sm">
          Welcome back! Please enter your details.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* SERVER ERROR DISPLAY */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-500 border border-red-100 animate-in zoom-in-95">
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* IDENTIFIER FIELD */}
        <div className="space-y-1.5">
          <Label
            htmlFor="identifier"
            className={cn(
              'text-[10px] font-black uppercase tracking-widest ml-1 transition-colors',
              errorMessage ? 'text-red-500' : 'text-gray-400',
            )}
          >
            Username or Email
          </Label>
          <Input
            id="identifier"
            type="text"
            placeholder="e.g. bintabespoke"
            {...register('identifier', { required: 'Username or email is required' })}
            disabled={isPending}
            className={cn(
              'h-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all',
              errorMessage && 'border-red-300 ring-red-50',
            )}
          />
        </div>

        {/* PASSWORD FIELD */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <Label
              htmlFor="password"
              className={cn(
                'text-[10px] font-black uppercase tracking-widest transition-colors',
                errorMessage ? 'text-red-500' : 'text-gray-400',
              )}
            >
              Password
            </Label>
            <Link
              to="/auth/forget-password"
              className="text-[10px] font-bold text-[#FF6B35] hover:underline uppercase tracking-tighter"
            >
              Forgot Password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            {...register('password', { required: 'Password is required' })}
            disabled={isPending}
            className={cn(
              'h-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all',
              errorMessage && 'border-red-300 ring-red-50',
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-14 bg-[#FF6B35] hover:bg-[#e85a20] text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-100 mt-2 transition-all active:scale-[0.98]"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
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

        <p className="mt-8 text-center text-sm font-medium text-gray-500">
          Don't have an account?
          <Link
            to="/auth/register"
            className="ml-1 text-[#FF6B35] font-black hover:underline underline-offset-4"
          >
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}
