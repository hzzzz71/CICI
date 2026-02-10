import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AccountPage: React.FC = () => {
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState('Member');
    const [memberSince, setMemberSince] = useState('2024');

    const handleLogout = () => {
        supabase.auth.signOut().finally(() => {
            navigate('/login');
        });
    }
    
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user?.email) {
                const name = data.user.email.split('@')[0] || 'Member';
                setDisplayName(name);
                if (data.user.created_at) {
                    const year = new Date(data.user.created_at).getFullYear();
                    if (!Number.isNaN(year)) {
                        setMemberSince(String(year));
                    }
                }
            }
        });
    }, []);

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-primary text-3xl font-bold">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">{displayName}</h1>
          <p className="mt-1 text-sm text-stone-500">member since {memberSince}</p>
        </div>

        <div className="mt-10 space-y-4">
          <Link to="/account/orders" className="group flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-primary">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-stone-900">My Orders</h3>
                <p className="text-sm text-stone-500">View your purchase history</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-stone-400 transition-transform group-hover:translate-x-1 group-hover:text-primary">chevron_right</span>
          </Link>

          <Link to="/account/addresses" className="group flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-primary">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-stone-900">My Addresses</h3>
                <p className="text-sm text-stone-500">Manage shipping & delivery info</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-stone-400 transition-transform group-hover:translate-x-1 group-hover:text-primary">chevron_right</span>
          </Link>

          <Link to="/support" className="group flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-primary">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-stone-900">Contact Support</h3>
                <p className="text-sm text-stone-500">Get help with your orders</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-stone-400 transition-transform group-hover:translate-x-1 group-hover:text-primary">chevron_right</span>
          </Link>

          <Link to="/account/settings" className="group flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-primary">
                <span className="material-symbols-outlined">settings</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-stone-900">Account Settings</h3>
                <p className="text-sm text-stone-500">Password, email & notifications</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-stone-400 transition-transform group-hover:translate-x-1 group-hover:text-primary">chevron_right</span>
          </Link>
        </div>

        <div className="pt-8">
          <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-stone-900 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Log Out
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-stone-400">Version 2.4.0</p>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
