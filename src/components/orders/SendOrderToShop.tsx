// Green "Send order details to <shop> on WhatsApp" button, shown after a
// payment attempt (paid, failed or cancelled). It opens WhatsApp with the
// message typed in; the buyer taps Send. Hidden when the shop has no valid
// phone number. Free click-to-chat link, no WhatsApp API.
import { useId, useState } from 'react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { formatNaira } from '@/lib/order-status';
import { buyerOrderMessage, whatsAppLink } from '@/lib/whatsapp';

export interface SendOrderToShopProps {
  shopName: string;
  shopPhone: string | null | undefined;
  orderNumber: string;
  items: { name: string; quantity: number }[];
  total: number;
  paid: boolean;
  deliveryMethod?: string;
  address?: string | null;
}

export default function SendOrderToShop(props: SendOrderToShopProps) {
  const [includeItems, setIncludeItems] = useState(true);
  const checkId = useId();
  const href = whatsAppLink(
    props.shopPhone,
    buyerOrderMessage({ ...props, totalText: formatNaira(props.total), includeItems }),
  );
  if (!href) return null;

  return (
    <div className="w-full">
      <label htmlFor={checkId} className="mb-2 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-gray-700">
        <input
          id={checkId}
          type="checkbox"
          checked={includeItems}
          onChange={(e) => setIncludeItems(e.target.checked)}
          className="h-5 w-5 shrink-0 accent-[#25D366]"
        />
        Include what I ordered
      </label>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-center text-[15px] font-bold leading-snug text-white shadow-sm hover:bg-[#1ebe5a] sm:w-auto"
      >
        <WhatsAppIcon size={22} className="shrink-0" />
        <span>Send order details to {props.shopName} on WhatsApp</span>
      </a>
      <p className="mt-1.5 text-xs text-gray-500">Opens WhatsApp. You tap Send.</p>
    </div>
  );
}
