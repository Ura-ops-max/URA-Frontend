import { useState } from "react";
import { AlertTriangle, Loader2, ShieldCheck, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from '@/lib/axios-client';
import { useAuthContext } from "@/context/auth-provider";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Step = 'warning' | 'kyc';

const BusinessWarningModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('warning');
  const [phone, setPhone] = useState((user as any)?.phone || '');
  const [bvn, setBvn] = useState('');

  // Client-side validation
  const isPhoneValid = phone.trim().length >= 10;
  const isBvnValid = bvn.trim().length === 11;
  const canSubmit = isPhoneValid && isBvnValid;

  const mutation = useMutation({
    mutationFn: async () => {
      return await API.post("/user/convert-to-business", { phone, bvn });
    },
    onSuccess: () => {
      toast.success("Welcome to Business Mode!");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Conversion failed. Please try again.");
    }
  });

  return (
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
                // ── Step 1: Warning ──
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Irreversible Action</h3>
                  <p className="text-gray-600 mt-4 leading-relaxed text-sm">
                    Converting to a <strong>Business Account</strong> is permanent. This allows you to list
                    products and receive reviews.
                    <br /><br />
                    Because business data (orders, reviews, products) is linked to your identity,
                    you <strong>cannot switch back</strong> to a regular user account later.
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
                // ── Step 2: KYC / Payluk Setup ──
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                      <ShieldCheck className="text-orange-500" size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">Verify Your Identity</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        Required for payment processing
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    To accept payments, we need to create a secure payment profile for your business.
                    This is a <span className="font-bold text-gray-700">one-time step</span>.
                  </p>

                  {/* Pre-filled read-only fields */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                        Full Name
                      </label>
                      <Input
                          value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                          disabled
                          className="h-11 rounded-xl bg-gray-50 border-gray-100 text-gray-400 font-bold"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                        Phone Number <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="+2348012345678"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className={cn(
                                "h-11 rounded-xl bg-gray-50 border-gray-100 pl-10 font-bold focus:bg-white",
                                phone && !isPhoneValid && "border-red-300 bg-red-50"
                            )}
                        />
                      </div>
                      {phone && !isPhoneValid && (
                          <p className="text-[10px] text-red-500 mt-1 ml-1">Enter a valid phone number</p>
                      )}
                    </div>

                    {/* BVN */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                        BVN (Bank Verification Number) <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <ShieldCheck size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="12345678901"
                            value={bvn}
                            onChange={e => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            maxLength={11}
                            className={cn(
                                "h-11 rounded-xl bg-gray-50 border-gray-100 pl-10 font-bold tracking-widest focus:bg-white",
                                bvn && !isBvnValid && "border-red-300 bg-red-50"
                            )}
                        />
                        {/* BVN digit counter */}
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">
                      {bvn.length}/11
                    </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 ml-1">
                        Dial *565*0# to retrieve your BVN
                      </p>
                    </div>
                  </div>

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
                        disabled={!canSubmit || mutation.isPending}
                        className="flex-1 py-3 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {mutation.isPending ? (
                          <><Loader2 className="animate-spin" size={18} /> Setting up...</>
                      ) : (
                          <><CheckCircle2 size={18} /> Convert to Business</>
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
  );
};

export default BusinessWarningModal;