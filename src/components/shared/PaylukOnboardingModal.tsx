import { useState } from 'react';
import { Phone, CreditCard, Loader2, ArrowRight, X, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import API from '@/lib/axios-client';
import { useAuthContext } from '@/context/auth-provider';

interface Props {
  onSuccess: () => void;
  onDismiss: () => void;
}

export default function PaylukOnboardingModal({ onSuccess, onDismiss }: Props) {
  const { user } = useAuthContext();

  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState((user as any)?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  // Which fields are missing from the user profile
  const needsFirstName = !user?.firstName?.trim();
  const needsLastName = !user?.lastName?.trim();
  const needsEmail = !(user as any)?.email?.trim();

  const handleSubmit = async () => {
    if (needsFirstName && !firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (needsLastName && !lastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (needsEmail && !email.trim()) {
      toast.error('Email address is required');
      return;
    }
    if (!phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!/^0[789][01]\d{8}$/.test(phone.trim())) {
      toast.error('Enter a valid Nigerian phone number (e.g. 08012345678)');
      return;
    }

    setIsLoading(true);
    try {
      await API.post('/onboarding/setup-payment-profile', {
        phone: phone.trim(),
        ...(firstName.trim() && { firstName: firstName.trim() }),
        ...(lastName.trim() && { lastName: lastName.trim() }),
      });

      toast.success('Payment profile created! You can now make purchases.');
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Setup failed. Please try again.';
      if (message.toLowerCase().includes('already')) {
        toast.success('Your payment profile is already active.');
        onSuccess();
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasMissingFields = needsFirstName || needsLastName || needsEmail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden">
        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 to-orange-400" />

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">
                Complete Payment Setup
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                Required for all transactions
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {hasMissingFields ? (
              'Your profile is incomplete. Please fill in the missing details to activate your payment profile.'
            ) : (
              <>
                To buy or sell on this platform you need a{' '}
                <span className="font-bold text-gray-700">Payluk payment profile</span>. This is a
                one-time setup using your phone number.
              </>
            )}
          </p>

          <div className="space-y-4 mb-6">
            {/* First name — only if missing */}
            {needsFirstName && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">
                  First Name <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-11 rounded-xl bg-gray-50 border-gray-100 focus:bg-white pl-9 font-bold"
                  />
                </div>
              </div>
            )}

            {/* Last name — only if missing */}
            {needsLastName && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">
                  Last Name <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-11 rounded-xl bg-gray-50 border-gray-100 focus:bg-white pl-9 font-bold"
                  />
                </div>
              </div>
            )}

            {/* Email — only if missing */}
            {needsEmail && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">
                  Email Address <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl bg-gray-50 border-gray-100 focus:bg-white pl-9 font-bold"
                  />
                </div>
              </div>
            )}

            {/* Phone — always required */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">
                Phone Number <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="0801-2345-678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  maxLength={11}
                  className="h-11 rounded-xl bg-gray-50 border-gray-100 focus:bg-white pl-9 font-bold tracking-widest"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-1">
                Must be a valid Nigerian number (070, 080, 090 prefix)
              </p>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-12 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-black gap-2 transition-all active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Setting up...
              </>
            ) : (
              <>
                Activate Profile <ArrowRight size={15} />
              </>
            )}
          </Button>

          <button
            onClick={onDismiss}
            className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 font-bold transition-colors py-2"
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
