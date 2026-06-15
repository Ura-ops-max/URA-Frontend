import type { ReactNode } from 'react';

export const FormField = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) => (
  <div className="w-full space-y-1.5">
    <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
  </div>
);

export const StyledInput = (props: any) => (
  <input
    {...props}
    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-sm"
  />
);
