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
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const didVerify = useRef(false);

  // Verify with a code (or the token from the email link — they're the same thing now).
  const verify = async (value: string) => {
    setStatus('verifying');
    try {
      const { data } = await API.get('/auth/verify-email', { params: { token: value } });
      setStatus('success');
      setMessage(data?.message || 'Your email has been verified. You can now sign in.');
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setStatus('error');
      setMessage(e?.response?.data?.message || 'That code is invalid or has expired.');
    }
  };

  // Auto-verify when a token is present in the link.
  useEffect(() => {
    if (!token || didVerify.current) return;
    didVerify.current = true;
    verify(token);
  }, [token]);

  const handleCodeSubmit = async () => {
    if (code.trim().length !== 6) {
      toast.error('Enter the 6-digit code from your email.');
      return;
    }
    setSubmitting(true);
    await verify(code.trim());
    setSubmitting(false);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      if (tokenStorage.getToken()) {
        // Logged in: the backend identifies the user from their session.
        await API.post('/settings/resend-verification');
      } else {
        // Not logged in (e.g. just registered): resend by email. Prefer the
        // email from the verify link, otherwise ask for it.
        const email = params.get('email') || window.prompt('Enter your email to resend the code:')?.trim();
        if (!email) {
          toast.error('Please enter your email to resend the code.');
          return;
        }
        await API.post('/auth/resend-verification', { email });
      }
      toast.success('A new code has been sent. Please check your inbox.');
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

        {(status === 'idle' || status === 'error') && (
          <>
            {status === 'error' ? (
              <XCircle className="mx-auto h-14 w-14 text-red-500" />
            ) : (
              <MailCheck className="mx-auto h-14 w-14 text-[#FF6B35]" />
            )}
            <h1 className="mt-6 text-xl font-bold text-gray-900">
              {status === 'error' ? 'Verification failed' : 'Verify your email'}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {status === 'error'
                ? message
                : 'Enter the 6-digit code we emailed you (or tap the button in that email).'}
            </p>

            {/* 6-digit code entry */}
            <input
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCodeSubmit();
              }}
              placeholder="123456"
              className="mx-auto mt-6 block w-48 rounded-xl border border-gray-200 py-3 text-center text-2xl font-bold tracking-[0.4em] text-gray-900 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"
            />
            <button
              onClick={handleCodeSubmit}
              disabled={submitting || code.length !== 6}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e85a20] disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify email'}
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-60"
            >
              {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MailCheck className="h-3.5 w-3.5" />}
              Resend code
            </button>

            <div className="mt-5">
              <Link to="/auth/login" className="text-sm font-medium text-gray-500 hover:underline">
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
