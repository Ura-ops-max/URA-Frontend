import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, CheckCircle2, Loader2, ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthContext } from '@/context/auth-provider';
import { toast } from 'sonner';
import API from '@/lib/axios-client';

const PaylukSetupPage = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const [phone, setPhone] = useState((user as any)?.phone || '');
    const [bvn, setBvn] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(!!(user as any)?.paylukCustomerId);

    const handleSetup = async () => {
        if (!phone.trim()) { toast.error('Please enter your phone number'); return; }
        if (!bvn.trim() || bvn.length !== 11) { toast.error('Please enter a valid 11-digit BVN'); return; }

        setIsLoading(true);
        try {
            await API.post('/order/setup-payment-profile', { phone, bvn });  // ← send bvn
            setIsDone(true);
            toast.success('Payment profile created! You can now make purchases.');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Setup failed. Please try again.';
            if (message.toLowerCase().includes('already')) {
                setIsDone(true);
                toast.success('Your payment profile is already active.');
            } else {
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">

                {/* Card */}
                <div className="bg-white rounded-[32px] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">

                    {/* Top accent bar */}
                    <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-400" />

                    <div className="p-10">

                        {isDone ? (
                            // ── Success state ──
                            <div className="flex flex-col items-center text-center py-4">
                                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <h1 className="text-2xl font-black text-gray-900 mb-2">You're all set!</h1>
                                <p className="text-gray-500 text-sm mb-8">
                                    Your payment profile is active and linked to your account.
                                    You can now make purchases securely with buyer protection.
                                </p>
                                <Button
                                    onClick={() => navigate('/dashboard/product/cart')}
                                    className="w-full h-12 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-black gap-2 transition-all"
                                >
                                    Continue Shopping <ArrowRight size={16} />
                                </Button>
                            </div>
                        ) : (
                            // ── Setup form ──
                            <>
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                                        <CreditCard className="w-7 h-7 text-orange-500" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-black text-gray-900 leading-tight">
                                            Set Up Payment Profile
                                        </h1>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                            One-time setup · Takes 5 seconds
                                        </p>
                                    </div>
                                </div>

                                {/* Explanation */}
                                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                                    To process payments securely, we need to create a payment profile for you.
                                    This is a <span className="font-bold text-gray-700">one-time step</span> — you'll
                                    never have to do it again.
                                </p>

                                {/* Pre-filled fields */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">
                                            Full Name
                                        </label>
                                        <Input
                                            value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                                            disabled
                                            className="h-12 rounded-xl bg-gray-50 border-gray-100 text-gray-400 font-bold"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">
                                            Email Address
                                        </label>
                                        <Input
                                            value={(user as any)?.email || ''}
                                            disabled
                                            className="h-12 rounded-xl bg-gray-50 border-gray-100 text-gray-400 font-bold"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">
                                            Phone Number <span className="text-orange-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="+2348012345678"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white pl-10 font-bold"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                                            Used for transaction notifications only
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">
                                            BVN (Bank Verification Number) <span className="text-orange-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="12345678901"
                                                value={bvn}
                                                onChange={e => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                                maxLength={11}
                                                className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white pl-10 font-bold tracking-widest"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                                            Your 11-digit BVN — used for identity verification only. Dial *565*0# to retrieve.
                                        </p>
                                    </div>
                                </div>

                                {/* CTA */}
                                <Button
                                    onClick={handleSetup}
                                    disabled={isLoading}
                                    className="w-full h-14 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black text-base gap-2 transition-all active:scale-95"
                                >
                                    {isLoading
                                        ? <><Loader2 className="animate-spin" size={18} /> Creating Profile...</>
                                        : <>Activate Payment Profile <ArrowRight size={16} /></>
                                    }
                                </Button>

                                {/* Trust badges */}
                                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                                    <ShieldCheck size={14} className="text-blue-400" />
                                    <span className="font-bold">Secured by Payluk · Buyer protection on every order</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Skip link */}
                {!isDone && (
                    <p className="text-center mt-6 text-sm text-gray-400">
                        Don't want to set up now?{' '}
                        <button
                            onClick={() => navigate(-1)}
                            className="text-orange-500 font-bold hover:underline"
                        >
                            Go back
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default PaylukSetupPage;