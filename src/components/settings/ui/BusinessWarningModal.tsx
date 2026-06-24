import { useState } from 'react';
import { AlertTriangle, Loader2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/axios-client';
import { useAuthContext } from '@/context/auth-provider';
import { toast } from 'sonner';
import PaylukOnboardingModal from '@/components/shared/PaylukOnboardingModal';

type Step = 'warning' | 'kyc';

const BusinessWarningModal = ({ onClose }: { onClose: () => void }) => {
  const { user, refetchAuth } = useAuthContext();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('warning');
  const [showPaylukModal, setShowPaylukModal] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      return await API.post('/users/me/convert-to-business');
    },
    onSuccess: () => {
      toast.success('Welcome to Business Mode!');
      // Refetch the auth user so isBusinessOwner flips to true immediately —
      // this is the query that gates the "Convert to Business" UI. Invalidating
      // 'user-profile'/'currentUser' alone left the auth context stale, so the
      // button kept showing and re-clicking hit "already a business".
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      refetchAuth();
      onClose();
    },
    onError: (error: any) => {
      const code = error.response?.data?.code;
      if (code === 'PAYLUK_PROFILE_REQUIRED') {
        // No Payluk profile — open onboarding modal, then retry conversion
        setShowPaylukModal(true);
        return;
      }
      toast.error(error.response?.data?.message || 'Conversion failed. Please try again.');
    },
  });

  // After Payluk setup completes, refetch auth then retry the conversion
  const handlePaylukSuccess = () => {
    setShowPaylukModal(false);
    refetchAuth();
    setTimeout(() => mutation.mutate(), 600);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Modal Card */}
        <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100">
            <div
              className="h-full bg-orange-500 transition-all duration-500"
              style={{ width: step === 'warning' ? '50%' : '100%' }}
            />
          </div>

          <div className="p-8">
            {step === 'warning' ? (
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Irreversible Action</h3>
                <p className="text-gray-600 mt-4 leading-relaxed text-sm">
                  Converting to a <strong>Business Account</strong> is permanent. This allows you to
                  list products and receive reviews.
                  <br />
                  <br />
                  Because business data (orders, reviews, products) is linked to your identity, you{' '}
                  <strong>cannot switch back</strong> to a regular user account later.
                </p>

                <div className="flex flex-col w-full gap-3 mt-8">
                  <button
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                    onClick={() => setStep('kyc')}
                  >
                    I Understand, Continue <ArrowRight size={16} />
                  </button>
                  <button
                    className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition"
                    onClick={onClose}
                  >
                    Wait, Let me think
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-orange-500" size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Convert to Business</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      Last step — this is permanent
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                  You're about to convert{' '}
                  <span className="font-bold text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                  's account to a business. You'll be able to list products and receive payments
                  immediately.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('warning')}
                    disabled={mutation.isPending}
                    className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                    className="flex-1 py-3 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin" size={18} /> Converting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} /> Convert to Business
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <ShieldCheck size={13} className="text-blue-400" />
                  <span className="font-bold">Secured by Payluk · Your data is encrypted</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Opens automatically if backend returns PAYLUK_PROFILE_REQUIRED */}
      {showPaylukModal && (
        <PaylukOnboardingModal
          onSuccess={handlePaylukSuccess}
          onDismiss={() => setShowPaylukModal(false)}
        />
      )}
    </>
  );
};

export default BusinessWarningModal;
