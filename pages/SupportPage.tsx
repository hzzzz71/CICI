import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string | number;
  sender: 'user' | 'support';
  text?: string;
  type: 'text' | 'product';
  product?: {
    name: string;
    description: string;
    image: string;
    id: string;
  };
}

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'support',
      type: 'text',
      text: 'Hi there! Welcome to JIELAN support. How can we help you find the perfect pair today?'
    },
    {
      id: 2,
      sender: 'user',
      type: 'text',
      text: "Hi, I'm looking for running shoes that are good for high arches."
    },
    {
      id: 3,
      sender: 'support',
      type: 'text',
      text: 'Great question! For high arches, we highly recommend our "CloudStrider" series. They offer reinforced arch support and extra cushioning. Would you like to see the latest colors?'
    },
    {
      id: 4,
      sender: 'support',
      type: 'product',
      product: {
        name: 'CloudStrider Pro 2.0',
        description: 'Running • High Arch Support',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIGO8BP6NNuMyh4A7okwNJ7CjV2RCDPh08zzoZUoKHI0oxLVH6IHYn15bq2moXkcYyEBFORe2dB7r9jFI4JAQAOm49ntCL2fZ-kTatdJJ3PAUqzFYpWMMbrG0PMNBRLtYSbhIsG0fzyjfc8IxzL4uWWWMzMX-jPqYWFwift0CnGxufUQRwzg9hDZFASaBMgWd_zXFlwjaW9uq1TUpGFI7BnqfVgMeuw9z7PQkjPZUFpnb7d6an19il4Yk6RnxRisXkrJjQV8TnN7s',
        id: '1' // Linking to existing product ID 1 for demo purposes
      }
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    fetch(`${baseUrl}/api/support/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((m: any) => ({
            id: m.id,
            sender: m.role === 'support' ? 'support' : 'user',
            type: 'text',
            text: m.text || '',
          }));
          setMessages(mapped);
        } else {
          fetch(`${baseUrl}/api/support/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'support', text: 'Hi there! Welcome to JIELAN support. How can we help you find the perfect pair today?' }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      text: text
    };

    const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    fetch(`${baseUrl}/api/support/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', text }),
    }).catch(() => {});

    const conversation = [...messages, newUserMsg].map((m) => ({
      role: m.sender === 'support' ? 'assistant' : 'user',
      text: m.text || '',
    }));

    fetch(`${baseUrl}/api/support/ai-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    })
      .then((res) => res.json())
      .then((data) => {
        const responseText =
          data && typeof data.reply === 'string'
            ? data.reply
            : 'Thanks for your message! One of our support agents will be with you shortly.';
        const newSupportMsg: Message = {
          id: Date.now() + 1,
          sender: 'support',
          type: 'text',
          text: responseText
        };
        setMessages(prev => [...prev, newSupportMsg]);
        fetch(`${baseUrl}/api/support/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'support', text: responseText }),
        }).catch(() => {});
      })
      .catch(() => {
        const fallbackText = "Thanks for your message! One of our support agents will be with you shortly.";
        const newSupportMsg: Message = {
          id: Date.now() + 1,
          sender: 'support',
          type: 'text',
          text: fallbackText
        };
        setMessages(prev => [...prev, newSupportMsg]);
      });
  };

  const handleProductClick = (id: string) => {
      navigate(`/product/${id}`);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-[1000px] mx-auto w-full p-4 md:p-6 lg:p-8">
      <section className="w-full flex flex-col bg-white rounded-2xl shadow-lg shadow-orange-900/5 border border-border-light overflow-hidden h-[calc(100vh-140px)] min-h-[600px]">
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-background-light custom-scrollbar">
          <div className="flex justify-center">
            <span className="text-xs font-medium text-stone-500 bg-orange-100/50 px-3 py-1 rounded-full">Today</span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : ''}`}>
              <div 
                className="bg-center bg-no-repeat bg-cover rounded-full size-9 shrink-0 mt-1 shadow-sm" 
                style={{ 
                    backgroundImage: msg.sender === 'support' 
                        ? "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBywlDm0vfjazodlIGuL9mXVg1pSk5NnSuP6Z96pgw3FvIYQ7cAMFbS-X-zfFGtBf12WZQTBPrcNFPLq1Gp68BJ6sd-_QfsutFc2xt0910fCsPl99l5kxL1sSPJtfzsh1tPrNYi-fwURt8Ctf1FTAA0w7PaeITjG3fmdHG6NBq_tdgUhcAMlfijTbgqBOhI5no78nxrlmujJaDlDUvfJw3j40pCuhQm4y6koujZ58ViQGznrVhv3KZO-F-sCyGpJVepDkzlvi8DiS4')"
                        : "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCs7gp5eddFbqF3NP7dqojyDmkMAYqOHvrbd3Yo55CiW38E9CmhfZaeiUPAwBwjorPbwwqLQpzKADbSWLfkroZO0muia0mtyw6SqUdYPr6vmK1QhdcemTGz2W7gbXN24cGMk_YJTchoH1V6YJ-WE25zatlM8n1_PVqlai6k91-5tkF7lzHKzKbbEp9sqeCVHdxFATV6i52Ja4-Eg5Jou4Ca9hS_LdzVP_ebLrKDyJyvcU5ZGELTQ9PncB9px_1hUnpoQ0Ac3V9mYlE')"
                }}
              ></div>
              <div className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : ''}`}>
                <span className={`text-xs font-medium text-stone-500 ${msg.sender === 'user' ? 'mr-1' : 'ml-1'}`}>
                    {msg.sender === 'support' ? 'JIELAN Support Team' : 'You'}
                </span>
                
                {msg.type === 'text' && (
                    <div className={`${msg.sender === 'support' ? 'bg-white rounded-tl-none border border-border-light text-stone-800' : 'bg-primary rounded-tr-none text-white shadow-md shadow-orange-500/20'} p-5 rounded-2xl shadow-sm text-[15px] leading-relaxed`}>
                        {msg.text}
                    </div>
                )}

                {msg.type === 'product' && msg.product && (
                    <div 
                        onClick={() => handleProductClick(msg.product!.id)}
                        className="mt-1 bg-white rounded-xl overflow-hidden border border-border-light max-w-sm shadow-sm group cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="aspect-video bg-stone-100 relative overflow-hidden">
                        <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url('${msg.product.image}')` }}></div>
                        </div>
                        <div className="p-4">
                        <h4 className="font-bold text-base text-stone-900">{msg.product.name}</h4>
                        <p className="text-xs text-stone-500 mb-3 font-medium">{msg.product.description}</p>
                        <button 
                            className="w-full py-2.5 bg-orange-50 text-primary text-xs font-bold rounded-lg hover:bg-orange-100 transition-colors uppercase tracking-wide"
                        >
                            View Product Details
                        </button>
                        </div>
                    </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-white border-t border-border-light">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
            <button 
                onClick={() => handleSendMessage("Where is my order?")}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-orange-50 hover:border-primary hover:text-primary transition-colors"
            >
              Where is my order?
            </button>
            <button 
                onClick={() => handleSendMessage("What is your Return Policy?")}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-orange-50 hover:border-primary hover:text-primary transition-colors"
            >
              Return Policy
            </button>
            <button 
                onClick={() => handleSendMessage("Do you have a Size Chart?")}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-orange-50 hover:border-primary hover:text-primary transition-colors"
            >
              Size Chart
            </button>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex-1 bg-stone-50 rounded-xl border border-stone-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all flex items-center px-4 py-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Type your message here..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-stone-800 placeholder-stone-400 h-10 p-0" 
              />
            </div>
            <button 
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className="size-12 rounded-xl bg-primary text-white shadow-lg shadow-orange-500/30 flex items-center justify-center hover:bg-primary-hover transition-colors transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[24px]">send</span>
            </button>
          </div>
          <p className="text-center text-[11px] text-stone-400 mt-3 font-medium">
            JIELAN support usually replies instantly during business hours.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SupportPage;
