import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

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
  const location = useLocation();
  const navigate = useNavigate();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportInput, setSupportInput] = useState('');
  const [supportMessages, setSupportMessages] = useState<Array<{ id: string | number; sender: 'user' | 'support'; text: string }>>([]);
  const [supportAccessToken, setSupportAccessToken] = useState<string>('');
  const supportEndRef = useRef<HTMLDivElement>(null);

  const parseSupportSegments = (text: string) => {
    const segments: Array<
      | { type: 'text'; text: string }
      | { type: 'card'; title: string; url: string; subtitle?: string }
    > = [];
    const regex = /\[\[CARD\|([^|\]]+)\|([^|\]]+)(?:\|([^\]]*))?\]\]/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const before = text.slice(last, match.index).trim();
      if (before) segments.push({ type: 'text', text: before });
      const title = (match[1] || '').trim();
      const url = (match[2] || '').trim();
      const subtitle = (match[3] || '').trim();
      if (title && url) segments.push({ type: 'card', title, url, subtitle });
      last = match.index + match[0].length;
    }
    const after = text.slice(last).trim();
    if (after) segments.push({ type: 'text', text: after });
    return segments.length > 0 ? segments : [{ type: 'text', text }];
  };

  useEffect(() => {
    supportEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [supportMessages, isSupportOpen]);

  useEffect(() => {
    if (!isSupportOpen) return;
    const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    supabase.auth.getSession().then(({ data }) => {
      const session = data?.session;
      const token = session?.access_token || '';
      setSupportAccessToken(token);
      if (!token) return;
      if (supportMessages.length > 0) return;
      fetch(`${baseUrl}/api/support/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setSupportMessages(
              data.map((m: any) => ({
                id: m.id,
                sender: m.role === 'support' ? 'support' : 'user',
                text: String(m.text || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim(),
              })),
            );
            return;
          }
          const welcomeText = 'Hi there! Welcome to JIELAN support. How can we help you today?';
          setSupportMessages([{ id: Date.now(), sender: 'support', text: welcomeText }]);
          fetch(`${baseUrl}/api/support/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ role: 'support', text: welcomeText }),
          }).catch(() => {});
        })
        .catch(() => {});
    });
  }, [isSupportOpen]);

  const handleSupportSend = () => {
    const text = supportInput.trim();
    if (!text) return;
    const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    if (!supportAccessToken) {
      navigate('/login');
      return;
    }
    const newUserMsg = { id: Date.now(), sender: 'user' as const, text };
    const nextConversation = [...supportMessages, newUserMsg];
    setSupportMessages(nextConversation);
    setSupportInput('');
    fetch(`${baseUrl}/api/support/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supportAccessToken}` },
      body: JSON.stringify({ role: 'user', text }),
    }).catch(() => {});
    fetch(`${baseUrl}/api/support/ai-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supportAccessToken}` },
      body: JSON.stringify({
        conversation: nextConversation.map((m) => ({
          role: m.sender === 'support' ? 'assistant' : 'user',
          text: m.text,
        })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const responseText =
          data && typeof data.reply === 'string'
            ? data.reply
            : 'Thanks for your message! One of our support agents will be with you shortly.';
        const newSupportMsg = { id: Date.now() + 1, sender: 'support' as const, text: responseText };
        setSupportMessages((prev) => [...prev, newSupportMsg]);
        fetch(`${baseUrl}/api/support/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supportAccessToken}` },
          body: JSON.stringify({ role: 'support', text: responseText }),
        }).catch(() => {});
      })
      .catch(() => {});
  };

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Header cartCount={cartCount} />
      <main className="flex-grow">{children}</main>
      <Footer />
      {location.pathname !== '/support' && location.pathname !== '/login' && (
        <>
          {isSupportOpen && (
            <div className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-border-light bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">support_agent</span>
                  <span className="text-sm font-bold text-stone-900">Support</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSupportOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-stone-600">close</span>
                </button>
              </div>
              <div className="h-[360px] overflow-y-auto bg-background-light p-4 space-y-3">
                {!supportAccessToken ? (
                  <div className="rounded-xl border border-border-light bg-white p-4 text-sm text-stone-700">
                    <div className="font-semibold text-stone-900 mb-2">请先登录</div>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors"
                    >
                      去登录
                    </button>
                  </div>
                ) : (
                  <>
                    {supportMessages.flatMap((m) => {
                      const segments = parseSupportSegments(m.text || '');
                      return segments.map((seg, idx) => {
                        if (seg.type === 'card') {
                          return (
                            <div key={`${m.id}_${idx}`} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div
                                onClick={() => (window.location.href = seg.url)}
                                className="max-w-[85%] rounded-2xl border border-border-light bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                              >
                                <div className="px-4 py-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-bold text-stone-900">{seg.title}</div>
                                    <span className="material-symbols-outlined text-stone-400">open_in_new</span>
                                  </div>
                                  {seg.subtitle && <div className="text-xs text-stone-500 mt-1 font-medium">{seg.subtitle}</div>}
                                  <div className="text-[11px] text-stone-400 mt-2 break-all">{seg.url}</div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={`${m.id}_${idx}`} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                m.sender === 'user'
                                  ? 'bg-primary text-white rounded-tr-none'
                                  : 'bg-white text-stone-800 border border-border-light rounded-tl-none'
                              }`}
                            >
                              {seg.text}
                            </div>
                          </div>
                        );
                      });
                    })}
                    <div ref={supportEndRef} />
                  </>
                )}
              </div>
              <div className="border-t border-border-light bg-white p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={supportInput}
                    onChange={(e) => setSupportInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSupportSend();
                    }}
                    placeholder="输入消息…"
                    className="h-10 flex-1 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    disabled={!supportAccessToken}
                  />
                  <button
                    type="button"
                    onClick={handleSupportSend}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                    disabled={!supportAccessToken || !supportInput.trim()}
                  >
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsSupportOpen((v) => !v)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-orange-500/30 hover:bg-primary-hover transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[28px]">{isSupportOpen ? 'close' : 'chat'}</span>
          </button>
        </>
      )}
    </div>
  );
};
