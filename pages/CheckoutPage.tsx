import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import { supabase } from '../lib/supabaseClient';

interface CheckoutPageProps {
  items: CartItem[];
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ items }) => {
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Calculate totals matching CartPage logic
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 12.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (user) {
        setUserId(user.id);
        if (user.email) {
          setUserEmail(user.email);
        }
      }
    });
  }, []);

  const handlePaymentClick = () => {
      setPaymentError('');
      setLoading(true);
      const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
      fetch(`${baseUrl}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerEmail: userEmail, userId }),
      })
        .then(async (r) => r.json())
        .then((data) => {
          setLoading(false);
          if (data && data.orderId) {
            try {
              localStorage.setItem('last_order_id', data.orderId);
            } catch {}
          }
          if (data && data.url) {
            window.location.href = data.url;
            return;
          }
          setIsPaymentModalOpen(true);
        })
        .catch(() => {
          setLoading(false);
          setIsPaymentModalOpen(true);
        });
  };

  const handlePaymentSuccess = () => {
      setIsPaymentModalOpen(false);
      const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
      let existingOrderId = '';
      try {
        existingOrderId = localStorage.getItem('last_order_id') || '';
      } catch {}
      const request = existingOrderId
        ? fetch(`${baseUrl}/api/orders/${existingOrderId}/paid`, { method: 'PUT' })
        : fetch(`${baseUrl}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, total, status: 'paid', email: userEmail, user_id: userId }),
          });
      request
        .then(async (r) => r.json())
        .then((data) => {
          if (data && data.id) {
            try {
              localStorage.setItem('last_order_id', data.id);
            } catch {}
          }
        })
        .finally(() => {
          navigate('/order-confirmation');
        });
  };

  const handlePaymentFailure = () => {
      setIsPaymentModalOpen(false);
      setPaymentError('Payment was not completed. Please try again.');
  };

  if (items.length === 0) return null;

  return (
    <div className="flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full relative">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 lg:border-r border-border-light">
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/cart" className="text-primary font-medium flex items-center gap-1 hover:text-primary-hover transition-colors">
            <span className="material-symbols-outlined !text-lg">check_circle</span>
            Shipping
          </Link>
          <span className="material-symbols-outlined text-stone-400 !text-base">chevron_right</span>
          <span className="text-stone-900 font-bold">Payment</span>
          <span className="material-symbols-outlined text-stone-400 !text-base">chevron_right</span>
          <span className="text-stone-500 font-medium">Confirmation</span>
        </nav>
        
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Payment Method</h2>
          <p className="text-stone-500 mb-8">Secure payment via Alipay (支付宝).</p>

          {paymentError && (
             <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in-up">
                <span className="material-symbols-outlined">error</span>
                <p className="text-sm font-medium">{paymentError}</p>
             </div>
          )}
          
          <div className="space-y-4 mb-8">
            <div className="relative rounded-xl border-2 border-[#1677FF] bg-blue-50/50 overflow-hidden shadow-sm">
              <label className="flex items-start p-4 cursor-pointer gap-4">
                <input type="radio" name="payment_method" className="mt-1 w-5 h-5 text-[#1677FF] border-stone-300 focus:ring-[#1677FF]" defaultChecked />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900">Alipay</span>
                      <span className="text-xs bg-[#1677FF] text-white px-1.5 rounded">支付宝</span>
                    </div>
                    <div className="flex gap-2 text-[#1677FF]">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                  </div>
                  <p className="text-sm text-stone-500">Scan QR code to pay securely with Alipay.</p>
                </div>
              </label>
              <div className="px-4 pb-6 pt-2 space-y-4 border-t border-[#1677FF]/20 bg-white/50 flex justify-center flex-col items-center">
                <p className="text-sm text-stone-600 text-center mb-2">Click "Pay" to generate your secure QR code.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handlePaymentClick}
            className="w-full bg-[#1677FF] hover:bg-[#0e60d3] text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 group disabled:opacity-50"
            disabled={loading}
          >
            <span className="material-symbols-outlined group-hover:animate-pulse">lock</span>
            Pay Now
          </button>
          
          <p className="mt-4 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined !text-sm text-green-600">verified_user</span>
            Your payment information is encrypted and secure.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[400px] xl:w-[440px] bg-white p-6 sm:p-8 flex flex-col h-full min-h-[500px] border-l border-border-light lg:bg-orange-50/30">
        <h3 className="text-lg font-bold text-stone-900 mb-6">Order Summary</h3>
        <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white border border-stone-200 flex-shrink-0 shadow-sm">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <span className="absolute -top-1 -right-1 bg-stone-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">{item.quantity}</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm">{item.name}</h4>
                    <div className="flex flex-col gap-0.5 mt-1">
                        <div className="flex items-center gap-1">
                            <div className="size-2 rounded-full border border-stone-200" style={{ backgroundColor: item.selectedColor }}></div>
                            <p className="text-xs text-stone-500">Size {item.selectedSize}</p>
                        </div>
                    </div>
                  </div>
                  <span className="font-medium text-stone-900 text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="py-6 border-t border-b border-stone-200 my-6">
          <div className="flex gap-2">
            <input type="text" placeholder="Gift card or discount code" className="flex-1 rounded-lg border-stone-300 bg-white text-sm focus:border-primary focus:ring-primary h-10 transition-shadow placeholder:text-stone-400" />
            <button className="bg-stone-200 text-stone-900 hover:bg-stone-300 font-medium px-4 rounded-lg text-sm transition-colors">Apply</button>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Taxes</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-900 font-bold text-lg pt-4 border-t border-stone-200 mt-4">
            <span>Total</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-stone-500 font-normal">USD</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alipay QR Code Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col items-center">
            <div className="bg-[#1677FF] w-full py-4 flex items-center justify-center gap-2 text-white">
                <span className="material-symbols-outlined">payments</span>
                <span className="font-bold text-lg">Alipay Payment</span>
            </div>
            <div className="p-8 flex flex-col items-center w-full">
                <p className="text-stone-500 text-sm mb-6 text-center">Please scan the QR code below with your Alipay app to complete the payment.</p>
                
                {/* Simulated QR Code Area */}
                <div className="w-48 h-48 bg-white border-2 border-stone-100 rounded-xl mb-6 flex items-center justify-center relative shadow-inner">
                    <span className="material-symbols-outlined text-[120px] text-stone-800 opacity-80">qr_code_2</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white p-1 rounded shadow-sm">
                             <div className="bg-[#1677FF] text-white text-[10px] font-bold px-1 rounded">支</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-8">
                     <span className="text-2xl font-bold text-stone-900">${total.toFixed(2)}</span>
                     <span className="text-xs text-stone-500 font-medium bg-stone-100 px-2 py-1 rounded">USD</span>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <button 
                        onClick={handlePaymentSuccess}
                        className="w-full bg-[#1677FF] hover:bg-[#0e60d3] text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Simulate Payment Success
                    </button>
                    <button 
                        onClick={handlePaymentFailure}
                        className="w-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium py-3 rounded-xl transition-colors"
                    >
                        Cancel Payment
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
