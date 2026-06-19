import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, MailCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import API from '@/lib/axios-client';
import { tokenStorage } from '@/lib/token-storage';

type Status = 'verifying' | 'success' | 'error' | 'idle';

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'idle');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const didVerify = useRef(false);

  // Auto-verify when a token is present in the link.
  useEffect(() => {
    if (!token || didVerify.current) return;
    didVerify.current = true;

    (async () => {
      try {
        const { data } = await API.get('/auth/verify-email', { params: { token } });
        setStatus('success');
        setMessage(data?.message || 'Your email has been verified. You can now sign in.');
      } catch (err) {
        const e = err as { response?: { data?: { message?: string } } };
        setStatus('error');
        setMessage(
          e?.response?.data?.message || 'This verification link is invalid or has expired.',
        );
      }
    })();
  }, [token]);

  const handleResend = async () => {
    // Resending requires the user to be logged in (the backend identifies them by token).
    if (!tokenStorage.getToken()) {
      toast.error('Please sign in first, then resend the verification email.');
      return;
    }
    setResending(true);
    try {
      await API.post('/settings/resend-verification');
      toast.success('Verification email sent. Please check your inbox.');
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Failed to send verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFB] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#FF6B35]" />
            <h1 className="mt-6 text-xl font-bold text-gray-900">Verifying your email…</h1>
            <p className="mt-2 text-sm text-gray-500">This will only take a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
            <h1 className="mt-6 text-xl font-bold text-gray-900">Email verified</h1>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            <Link
              to="/auth/login"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e85a20]"
            >
              Continue to sign in <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-red-500" />
            <h1 className="mt-6 text-xl font-bold text-gray-900">Verification failed</h1>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e85a20] disabled:opacity-60"
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
              Resend verification email
            </button>
            <div className="mt-4">
              <Link to="/auth/login" className="text-sm font-medium text-gray-500 hover:underline">
                Back to sign in
              </Link>
            </div>
          </>
        )}

        {status === 'idle' && (
          <>
            <MailCheck className="mx-auto h-14 w-14 text-[#FF6B35]" />
            <h1 className="mt-6 text-xl font-bold text-gray-900">Verify your email</h1>
            <p className="mt-2 text-sm text-gray-500">
              We sent a verification link to your email address. Open it to verify your account. Didn’t
              get it? Resend it below.
            </p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e85a20] disabled:opacity-60"
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
              Resend verification email
            </button>
            <div className="mt-4">
              <Link to="/dashboard" className="text-sm font-medium text-gray-500 hover:underline">
                Back to dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
