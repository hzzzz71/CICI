import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data?.session;
      if (!session?.access_token) {
        navigate('/login');
        return;
      }
      try {
        const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
        const res = await fetch(`${baseUrl}/api/my-orders`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = await res.json();
        if (Array.isArray(payload)) {
          setOrders(payload);
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <p className="text-sm text-stone-500">Loading your orders...</p>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">My Orders</h1>
        <p className="text-sm text-stone-500 mb-6">You have not placed any orders yet.</p>
        <button
          onClick={() => navigate('/shop')}
          className="rounded-full bg-primary text-white px-6 py-3 text-sm font-semibold hover:bg-primary-hover transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-900">My Orders</h1>
          <button
            onClick={() => navigate('/account')}
            className="text-sm text-primary font-semibold hover:text-primary-hover flex items-center gap-1"
          >
            <span className="material-symbols-outlined !text-base">arrow_back</span>
            Back to Account
          </button>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-border-light bg-white p-6 shadow-sm flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-stone-500">Order ID</p>
                  <p className="text-sm font-semibold text-stone-900">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-stone-500">Placed on</p>
                  <p className="text-sm font-semibold text-stone-900">
                    {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">local_mall</span>
                  <p className="text-sm text-stone-700">
                    {Array.isArray(order.items) && order.items.length > 0
                      ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}`
                      : 'No item details'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-stone-500">Total</p>
                  <p className="text-lg font-bold text-stone-900">${Number(order.total || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border-light">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === 'paid'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}
                  >
                    {order.status === 'paid' ? 'Paid' : order.status}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/support')}
                  className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
                >
                  <span className="material-symbols-outlined !text-base">support_agent</span>
                  Need help?
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
