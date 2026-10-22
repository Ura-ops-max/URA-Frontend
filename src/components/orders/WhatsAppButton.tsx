// Opens WhatsApp with a message typed in. The person taps Send themselves.
import { MessageCircle } from 'lucide-react';
import { whatsAppLink } from '@/lib/whatsapp';

export default function WhatsAppButton({
  phone,
  text,
  label,
  showNote = true,
}: {
  phone: string | null | undefined;
  text: string;
  label: string;
  showNote?: boolean;
}) {
  const href = whatsAppLink(phone, text);
  if (!href) return null;
  return (
    <div className="w-full sm:w-auto">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-4 text-sm font-bold text-green-700 hover:bg-green-100 sm:h-9 sm:w-auto"
      >
        <MessageCircle size={16} />
        {label}
      </a>
      {showNote && <p className="mt-1 text-[11px] text-gray-500">Opens WhatsApp. You tap Send.</p>}
    </div>
  );
}
