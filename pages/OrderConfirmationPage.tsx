import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const OrderConfirmationPage: React.FC = () => {
  const [orderId, setOrderId] = useState<string>('JL-8842');

  useEffect(() => {
    try {
      const hash = window.location.hash || '';
      const query = hash.includes('?') ? hash.split('?')[1] : '';
      if (query) {
        const params = new URLSearchParams(query);
        const fromUrl = params.get('orderId');
        if (fromUrl) {
          setOrderId(fromUrl);
          localStorage.setItem('last_order_id', fromUrl);
          return;
        }
      }
      const id = localStorage.getItem('last_order_id');
      if (id) setOrderId(id);
    } catch {}
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col max-w-[800px] w-full gap-10">
        <div className="flex flex-col items-center text-center gap-8 py-12">
          <div className="flex items-center justify-center w-28 h-28 rounded-full bg-orange-100 text-primary animate-bounce">
            <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>check_circle</span>
          </div>
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-stone-900 text-5xl md:text-6xl font-black tracking-[-0.033em] leading-tight uppercase">
              Thank you <br /> for your purchase!
            </h1>
            <p className="text-stone-500 text-lg font-normal max-w-lg mx-auto leading-relaxed pt-2">
              Your order <span className="text-primary font-bold">#{orderId}</span> has been confirmed. <br /> We've sent a detailed receipt to your email address.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
          <Link to="/account" className="flex w-full sm:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary hover:bg-primary-hover transition-colors text-white text-lg font-bold leading-normal tracking-[0.015em] shadow-lg shadow-orange-500/20">
            Track Your Order
          </Link>
          <Link to="/" className="flex w-full sm:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-transparent border-2 border-border-light hover:bg-[#f5f5f4] transition-colors text-stone-900 text-lg font-bold leading-normal tracking-[0.015em]">
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
