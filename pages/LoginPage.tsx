import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const syncProfile = async (userId: string, userEmail: string | null) => {
    const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    try {
      await fetch(`${baseUrl}/api/profiles/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, email: userEmail }),
      });
    } catch (e) {
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    if (mode === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const message = error.message || '';
        if (message.toLowerCase().includes('email not confirmed')) {
          setError('邮箱尚未验证，请先前往邮箱点击验证链接，或点击下方按钮重新发送验证邮件。');
        } else {
          setError(message);
        }
        return;
      }
      const user = data.user;
      if (user) {
        await syncProfile(user.id, user.email ?? null);
      }
      navigate('/account');
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      const user = data.user;
      if (user) {
        await syncProfile(user.id, user.email ?? null);
      }
      setInfo('注册成功！我们已向您的邮箱发送验证邮件，请前往邮箱完成验证后再使用该邮箱和密码登录。');
      setMode('signin');
      setPassword('');
    }
  };

  const handleResendVerification = async () => {
    setError('');
    setInfo('');
    if (!email) {
      setError('请先在上方输入需要验证的邮箱地址');
      return;
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) {
      setError(error.message);
      return;
    }
    setInfo('验证邮件已重新发送，请检查邮箱（包括垃圾邮箱）中的来自 JIELAN 的邮件。');
  };

  return (
    <div className="min-h-screen flex flex-col">
       <header className="flex items-center justify-center border-b border-solid border-border-light bg-white px-10 py-6 z-20 sticky top-0">
          <div className="flex items-center gap-3 text-stone-900">
            <Link to="/" className="text-2xl font-black tracking-tight text-primary">JIELAN</Link>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center p-4 md:p-8 bg-background-light">
          <div className="w-full max-w-[1000px] bg-white rounded-2xl shadow-xl shadow-orange-900/5 overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-stone-100">
            <div 
                className="hidden md:flex w-1/2 bg-stone-50 relative flex-col justify-between p-8 bg-cover bg-center" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAB3DyEvQKzpsT1I7VlTaZ13WoDu9Flg2dUsu2zV3QsE4U4I-B5m6e3-TFT-PjgSlD30AdiFDI1USgnKTChoss6GXjRQCQPmTYIfg2Dr-n5FrGsq_GW3hfU5Vy_u7TG_VkFzEl92AuHU8z_7kF1FXKNTEs5RkLXnHiV3_I_cVtwJ-jRFf3XZV4QafTZ8WI96zi0HGGMNa_ztzi9MiCQgQUzYz8gC6mj11NJfq_OaJTsV_6t_47rnzcfsQ5SIeph06MBmPJ00fcfrkg')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-orange-950/80 to-transparent z-0"></div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-xs font-medium text-white tracking-wide uppercase">Autumn Collection</span>
              </div>
              <div className="relative z-10 text-white">
                <h1 className="text-4xl font-bold leading-tight mb-2 tracking-tight">Step Into Warmth</h1>
                <p className="text-orange-100 text-sm font-medium leading-relaxed max-w-[320px]">
                  Join the JIELAN community for exclusive access to the latest drops, limited editions, and member-only events.
                </p>
                <div className="mt-6 flex gap-2">
                  <div className="h-1 w-8 bg-white rounded-full"></div>
                  <div className="h-1 w-2 bg-white/40 rounded-full"></div>
                  <div className="h-1 w-2 bg-white/40 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col justify-center">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-stone-900 mb-2">Welcome to Jielan</h2>
                <p className="text-stone-500 text-sm">Please enter your details to sign in.</p>
              </div>
              
              <div className="flex p-1 mb-8 bg-stone-100 rounded-lg">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="auth-mode" value="signin" className="peer sr-only" defaultChecked onChange={() => setMode('signin')} />
                  <div className="text-center text-sm font-medium py-2 rounded-md text-stone-500 peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm transition-all duration-200">
                    Sign In
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="auth-mode" value="signup" className="peer sr-only" onChange={() => setMode('signup')} />
                  <div className="text-center text-sm font-medium py-2 rounded-md text-stone-500 peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm transition-all duration-200">
                    Create Account
                  </div>
                </label>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-stone-900">Email Address</label>
                  <div className="relative">
                    <input id="email" type="email" placeholder="name@example.com" className="w-full h-11 px-4 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-stone-900 text-sm placeholder:text-stone-400 transition-colors" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-stone-900">Password</label>
                    <a href="#" className="text-xs font-medium text-primary hover:text-primary-hover transition-colors">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <input id="password" type="password" placeholder="Enter your password" className="w-full h-11 px-4 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-stone-900 text-sm placeholder:text-stone-400 transition-colors pr-10" value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </div>
                </div>
                <button type="submit" className="mt-2 w-full h-11 flex items-center justify-center bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-orange-500/20 active:scale-[0.98]">
                  Continue
                </button>
              </form>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {info && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  <p className="text-sm font-medium">{info}</p>
                </div>
              )}

              {mode === 'signin' && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-xs font-medium text-primary hover:text-primary-hover underline-offset-2 hover:underline"
                  >
                    没收到验证邮件？点击这里重新发送
                  </button>
                </div>
              )}

              <div className="relative my-8">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-stone-500 font-medium uppercase tracking-wide">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 h-10 px-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors bg-white text-stone-700 text-sm font-medium">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    Google
                </button>
                <button className="flex items-center justify-center gap-2 h-10 px-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors bg-white text-stone-700 text-sm font-medium">
                  <svg className="w-5 h-5 text-[#1877F2]" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                  Facebook
                </button>
              </div>

              <p className="mt-8 text-center text-xs text-stone-400">
                By signing in, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </main>
        <footer className="py-6 text-center text-stone-400 text-xs bg-background-light">
          <p>© 2024 JIELAN Inc. All rights reserved.</p>
        </footer>
    </div>
  );
};

export default LoginPage;
