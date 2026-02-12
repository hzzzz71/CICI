import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { fetchProducts } from '../lib/api';

const HomePage: React.FC = () => {
  const [data, setData] = useState(PRODUCTS);

  useEffect(() => {
    fetchProducts().then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        const mapped = res.map((p: any) => ({
          id: p.id || '',
          name: p.name,
          category: p.category,
          price: Number(p.price),
          image: p.image,
          description: p.description || undefined,
          colors: p.colors || undefined,
          rating: p.rating || undefined,
          reviews: p.reviews || undefined,
          isNew: p.is_new || false,
          isSale: p.is_sale || false,
          isLimited: p.is_limited || false,
          stockLow: !!p.stock_low,
        }));
        setData(mapped);
      }
    }).catch(() => {});
  }, []);

  const trendingProducts = data.slice(1, 4);

  return (
    <div className="flex-1">
      <section className="relative mx-auto max-w-7xl px-4 pt-6 pb-12">
        <div className="group relative flex min-h-[500px] md:min-h-[600px] w-full flex-col justify-end overflow-hidden rounded-2xl md:rounded-3xl bg-[#2d2420] px-6 py-12 md:px-16 md:py-20 shadow-xl">
          <div className="absolute inset-0 z-0 h-full w-full">
            <img
              alt="Pair of running shoes mid-air on concrete background"
              className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0La3OC70U8TBe4Xsq5AFznbPQeaSz6GXJjwSNh4IBwe0003B0F1r-m51HpGpmbt_WgfW9-sTirV-VBs7870BKfp1SOlr3C2pmR9-Z29SdZPg-XC8Uy8HSE7rEpkiEyHz6a35oqwsKmmd6nq81p2BU_Qo_GGUV0mtpfbZfp_cbqQaHLDbu2uMhuEoHWXO74BIFpj-LWmoPtu96XnYsT7oIxzM3KaaryJJnlSMfbwJHhUc-KRI0-e68AhvVtJ4dfgz8QxPwmh2WDx4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2d2420]/90 via-[#2d2420]/30 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-2xl animate-fade-in-up">
            <span className="mb-4 inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              New Release
            </span>
            <h1 className="mb-4 text-4xl font-black leading-tight tracking-tighter text-white md:text-6xl lg:text-7xl">
              Walk on Air.<br />
              The Horizon Series.
            </h1>
            <p className="mb-8 max-w-lg text-lg text-[#e7e0d6] md:text-xl font-light">
              Engineered for maximum comfort and explosive energy return. Designed for those who dare to lead.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/shop" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-stone-900 transition-colors hover:bg-primary hover:text-white md:h-14 md:text-lg">
                Shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">Trending This Week</h2>
          <Link to="/shop" className="hidden text-sm font-semibold text-primary hover:text-primary-hover md:flex items-center gap-1 group">
            View all
            <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trendingProducts.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group relative flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-lg border border-border-subtle">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-100">
                <img
                  alt={product.name}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  src={product.image}
                />
                {product.isNew && (
                  <div className="absolute top-3 left-3 rounded bg-stone-900 px-2 py-1 text-xs font-bold text-white">
                    New
                  </div>
                )}
                 {product.name === "Urban Loafer" && (
                    <div className="absolute top-3 left-3 rounded bg-stone-900 px-2 py-1 text-xs font-bold text-white">
                        Best Seller
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-900/50 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button className="w-full rounded bg-white py-2 text-sm font-bold text-stone-900 shadow-sm hover:bg-background-warm">Quick View</button>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">{product.name}</h3>
                    <p className="text-sm text-stone-500">{product.category}</p>
                  </div>
                  <p className="text-lg font-semibold text-stone-900">${product.price.toFixed(2)}</p>
                </div>
                {product.colors && (
                  <div className="mt-3 flex gap-2">
                    {product.colors.map((color, idx) => (
                      <div 
                        key={idx} 
                        className="h-4 w-4 rounded-full ring-1 ring-border-subtle ring-offset-1" 
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex justify-center md:hidden">
          <Link to="/shop" className="flex w-full items-center justify-center rounded-lg border border-border-subtle bg-white px-6 py-3 text-sm font-bold text-stone-900 hover:bg-background-warm">
            View All Products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
