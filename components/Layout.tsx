import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  cartCount: number;
}

export const Header: React.FC<{ cartCount: number }> = ({ cartCount }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Hide header on login page
  if (location.pathname === '/login') return null;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Custom header for Checkout
  if (location.pathname === '/checkout') {
     return (
        <header className="sticky top-0 z-50 w-full border-b border-border-light bg-white/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link to="/" className="text-2xl font-black tracking-tight text-primary uppercase">JIELAN</Link>
                </div>
                <div className="flex items-center gap-2 text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-200">
                    <span className="material-symbols-outlined !text-lg">lock</span>
                    <span>Secure Checkout</span>
                </div>
            </div>
        </header>
     )
  }

  // Custom header for Order Confirmation
  if (location.pathname === '/order-confirmation') {
      return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light px-10 py-4 bg-surface-light">
            <div className="flex items-center gap-4 text-stone-900">
                <Link to="/" className="text-2xl font-black leading-tight tracking-[-0.02em] text-primary">JIELAN</Link>
            </div>
            <div className="flex flex-1 justify-end gap-4">
                <Link to="/account" className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#f5f5f4] text-stone-900 hover:bg-[#e7e5e4] transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
                </Link>
                <Link to="/cart" className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#f5f5f4] text-stone-900 hover:bg-[#e7e5e4] transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>shopping_cart</span>
                </Link>
            </div>
        </header>
      );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <h2 className="text-2xl font-bold tracking-tight text-primary hover:text-primary-hover transition-colors">JIELAN</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden lg:flex items-center relative w-64">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className="h-10 w-full rounded-lg border-0 bg-stone-100 pl-10 pr-4 text-sm text-stone-900 focus:ring-2 focus:ring-primary placeholder:text-stone-400 transition-shadow" 
              placeholder="Search shoes..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="flex items-center gap-2">
            <button 
                onClick={(e) => {
                    const form = document.querySelector('.mobile-search-form');
                    form?.classList.toggle('hidden');
                }}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-orange-50 transition-colors"
            >
              <span className="material-symbols-outlined text-stone-700">search</span>
            </button>
            <Link to="/account" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-orange-50 transition-colors">
              <span className="material-symbols-outlined text-stone-700">person</span>
            </Link>
            <Link to="/cart" className="group relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-orange-50 transition-colors">
              <span className="material-symbols-outlined text-stone-700">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      {/* Mobile Search Bar */}
      <div className="mobile-search-form hidden lg:hidden w-full px-4 py-2 border-t border-border-light bg-white">
        <form onSubmit={handleSearch} className="flex items-center relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className="h-10 w-full rounded-lg border-0 bg-stone-100 pl-10 pr-4 text-sm text-stone-900 focus:ring-2 focus:ring-primary placeholder:text-stone-400 transition-shadow" 
              placeholder="Search shoes..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </form>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  const location = useLocation();
  if (location.pathname === '/login' || location.pathname === '/support') return null;

  return (
    <footer className="border-t border-border-light bg-background-warm py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex flex-col gap-4 max-w-sm">
          <h2 className="text-xl font-bold tracking-tight text-primary">JIELAN</h2>
          <p className="text-sm text-stone-600">
            Premium footwear designed for the modern explorer. Quality, comfort, and style in every step.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-stone-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-stone-500">
        <p>© 2024 JIELAN Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, cartCount }) => {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Header cartCount={cartCount} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};
