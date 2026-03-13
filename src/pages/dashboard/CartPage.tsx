
import { useCartContext } from '@/context/cart-provider';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const CartPage = () => {
  const { cart, totalItems, totalPrice, updateQty, removeItem, isLoading, isUpdating } = useCartContext();

  const formattedPrice = (price: number) => 
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(price);

  if (isLoading) return <div className="h-96 flex items-center justify-center">Loading your cart...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/dashboard/deal-offer">
          <Button className="bg-orange-600 hover:bg-orange-700 h-12 px-8 rounded-xl font-bold">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900">Your Cart <span className="text-orange-500">({totalItems})</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT: ITEMS LIST */}
        <div className={cn("lg:col-span-8 space-y-6 transition-opacity", isUpdating && "opacity-60 pointer-events-none")}>
          {cart.items.map((item: any) => (
            <div key={item.product._id} className="group relative flex gap-4 md:gap-6 bg-white p-4 rounded-2xl border border-gray-100 transition-all hover:border-orange-100 hover:shadow-sm">
              {/* Product Image */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                <img src={item.product.media[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-1 min-w-0 py-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base truncate pr-6">{item.product.name}</h3>
                  <button 
                    onClick={() => removeItem(item.product._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-4">{item.product.business?.businessName || 'Merchant'}</p>

                <div className="mt-auto flex items-center justify-between">
                  {/* Quantity Controller */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-9">
                    <button 
                      onClick={() => updateQty(item.product._id, item.quantity - 1)}
                      className="px-3 hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQty(item.product._id, item.quantity + 1)}
                      className="px-3 hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <span className="font-black text-gray-900">{formattedPrice(item.product.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: SUMMARY CARD */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-gray-50 rounded-3xl p-6 lg:p-8 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 text-sm font-medium">
                <span>Subtotal</span>
                <span>{formattedPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm font-medium">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">Calculated at next step</span>
              </div>
              <Separator />
              <div className="flex justify-between text-gray-900">
                <span className="font-black text-lg">Total</span>
                <span className="font-black text-2xl text-orange-600">{formattedPrice(totalPrice)}</span>
              </div>
            </div>

            <Link to="/dashboard/checkout">
              <Button className="w-full h-14 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black gap-2 transition-all shadow-xl shadow-gray-200">
                Proceed to Checkout
                <ArrowRight size={18} />
              </Button>
            </Link>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-3 text-gray-400">
                <ShieldCheck size={24} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 text-gray-500">Secure Checkout</p>
                  <p className="text-[10px] text-gray-400">Encrypted transaction via our secure server.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;