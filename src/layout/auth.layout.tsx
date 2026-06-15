import { Outlet } from 'react-router-dom';
import Logo from '@/components/shared/Logo';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT SIDE: Brand Hero (Desktop Only) */}
      <div className="relative hidden w-[45%] lg:flex flex-col justify-between p-12 overflow-hidden">
        {/* The background image from your inspiration */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        {/* Dark Overlay to make text pop */}
        <div className="absolute inset-0 z-10 bg-black/40" />

        <div className="relative z-20">
          <Logo />
        </div>

        <div className="relative z-20 mb-8">
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
            Welcome to URA!
          </h1>
          <p className="mt-4 text-lg text-white/90 font-medium max-w-md leading-relaxed">
            Sign Up for the full URA experience. Connect with your local market, grow your brand,
            faster, smarter, and socially.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Your Actual Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[55%] lg:px-20 bg-white">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-right-8 duration-700">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
